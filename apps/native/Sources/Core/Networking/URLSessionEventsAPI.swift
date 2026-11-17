import Foundation

/// Implémentation réseau de `GET /events` (contrat/openapi.yaml).
///
/// L'URL de base vient de la clé Info.plist `EventsAPIBaseURL`, alimentée par le build setting
/// `EVENTS_API_BASE_URL` (project.yml). En Debug, le défaut est le mock Prism
/// (`prism mock contrat/openapi.yaml -p 4010`). En Release, aucune valeur par défaut :
/// sans configuration, la requête échoue au lieu de viser `localhost`.
struct URLSessionEventsAPI: EventsAPI {
    var baseURL: URL? = Self.configuredBaseURL
    var session: URLSession = .shared

    func fetchEvents() async throws -> [Event] {
        guard let baseURL else { throw URLError(.badURL) }
        let (data, response) = try await session.data(from: baseURL.appending(path: "events"))
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }
        return try Self.decoder.decode([Event].self, from: data)
    }

    static var configuredBaseURL: URL? {
        let raw = Bundle.main.object(forInfoDictionaryKey: "EventsAPIBaseURL") as? String
        if let raw, !raw.isEmpty, let url = URL(string: raw) { return url }
        #if DEBUG
        return URL(string: "http://localhost:4010")
        #else
        return nil
        #endif
    }

    private static let isoWithFraction = Date.ISO8601FormatStyle(includingFractionalSeconds: true)
    private static let isoPlain = Date.ISO8601FormatStyle()

    private static let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let raw = try decoder.singleValueContainer().decode(String.self)
            if let date = try? isoWithFraction.parse(raw) { return date }
            if let date = try? isoPlain.parse(raw) { return date }
            throw DecodingError.dataCorrupted(
                .init(codingPath: decoder.codingPath, debugDescription: "Date invalide : \(raw)")
            )
        }
        return decoder
    }()
}
