import Foundation

/// Implémentation réseau de `GET /events` (contrat/openapi.yaml).
struct URLSessionEventsAPI: EventsAPI {
    /// Prism (mock généré depuis contrat/openapi.yaml) : `npx @stoplight/prism-cli mock contrat/openapi.yaml -p 4010 -d`
    var baseURL = URL(string: "http://localhost:4010")!
    var session: URLSession = .shared

    func fetchEvents() async throws -> [Event] {
        let (data, response) = try await session.data(from: baseURL.appending(path: "events"))
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }
        return try Self.decoder.decode([Event].self, from: data)
    }

    private static var decoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let raw = try decoder.singleValueContainer().decode(String.self)
            let withFraction = Date.ISO8601FormatStyle(includingFractionalSeconds: true)
            if let date = try? withFraction.parse(raw) { return date }
            if let date = try? Date.ISO8601FormatStyle().parse(raw) { return date }
            throw DecodingError.dataCorrupted(
                .init(codingPath: decoder.codingPath, debugDescription: "Date invalide : \(raw)")
            )
        }
        return decoder
    }
}
