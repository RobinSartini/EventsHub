import Foundation

/// Erreurs réseau communes à tous les clients d'API de l'app.
enum APIError: LocalizedError, Equatable {
    case invalidURL
    case network
    case badRequest
    case unauthorized
    case forbidden
    case unprocessable
    case server
    case decoding

    var errorDescription: String? {
        switch self {
        case .invalidURL: "L'adresse du serveur est invalide."
        case .network: "Connexion impossible. Vérifie ton réseau."
        case .badRequest: "Les informations envoyées sont invalides."
        case .unauthorized: "Authentification requise."
        case .forbidden: "Action non autorisée."
        case .unprocessable: "Les informations envoyées ont été refusées."
        case .server: "Le serveur a rencontré une erreur. Réessaie plus tard."
        case .decoding: "La réponse du serveur est illisible."
        }
    }
}

/// Client HTTP global : URL de base, session, vérification du statut et décodage JSON.
///
/// L'URL de base vient de la clé Info.plist `EventsAPIBaseURL`, alimentée par le build setting
/// `EVENTS_API_BASE_URL` (project.yml). En Debug, le défaut est le mock Prism
/// (`prism mock contrat/openapi.yaml -p 4010`). En Release, aucune valeur par défaut :
/// sans configuration, la requête échoue au lieu de viser `localhost`.
struct APIClient: Sendable {
    var baseURL: URL? = Self.configuredBaseURL
    var session: URLSession = .shared

    static var configuredBaseURL: URL? {
        let raw = Bundle.main.object(forInfoDictionaryKey: "EventsAPIBaseURL") as? String
        if let raw, !raw.isEmpty, let url = URL(string: raw) { return url }
        #if DEBUG
        return URL(string: "http://localhost:4010")
        #else
        return nil
        #endif
    }

    /// Exécute la requête, vérifie le statut et renvoie le corps brut.
    @discardableResult
    func sendRaw(_ method: String, path: String, body: (any Encodable)? = nil) async throws -> Data {
        guard let baseURL else { throw APIError.invalidURL }
        var request = URLRequest(url: baseURL.appending(path: path))
        request.httpMethod = method
        if let body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            do {
                request.httpBody = try JSONEncoder().encode(body)
            } catch {
                throw APIError.badRequest
            }
        }
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch let error as URLError where error.code == .cancelled {
            throw error
        } catch is CancellationError {
            throw CancellationError()
        } catch {
            throw APIError.network
        }
        guard let http = response as? HTTPURLResponse else { throw APIError.server }
        switch http.statusCode {
        case 200..<300: return data
        case 400: throw APIError.badRequest
        case 401: throw APIError.unauthorized
        case 403: throw APIError.forbidden
        case 422: throw APIError.unprocessable
        default: throw APIError.server
        }
    }

    /// Exécute la requête et décode la réponse JSON.
    func send<T: Decodable>(_ method: String, path: String, body: (any Encodable)? = nil) async throws -> T {
        let data = try await sendRaw(method, path: path, body: body)
        do {
            return try Self.makeDecoder().decode(T.self, from: data)
        } catch {
            throw APIError.decoding
        }
    }

    private static func makeDecoder() -> JSONDecoder {
        let withFraction = Date.ISO8601FormatStyle(includingFractionalSeconds: true)
        let plain = Date.ISO8601FormatStyle()
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let raw = try decoder.singleValueContainer().decode(String.self)
            if let date = try? withFraction.parse(raw) { return date }
            if let date = try? plain.parse(raw) { return date }
            throw DecodingError.dataCorrupted(
                .init(codingPath: decoder.codingPath, debugDescription: "Date invalide : \(raw)")
            )
        }
        return decoder
    }
}
