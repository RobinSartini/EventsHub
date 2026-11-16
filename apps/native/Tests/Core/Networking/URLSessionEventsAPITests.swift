import Foundation
import Testing
@testable import EventsHub

/// Faux transport : intercepte les requêtes de la session et renvoie la réponse configurée par le test.
private final class StubURLProtocol: URLProtocol {
    struct Stub {
        let statusCode: Int
        let body: Data
    }

    /// Accès sérialisé par `@Suite(.serialized)` : un seul test configure le stub à la fois.
    nonisolated(unsafe) static var stub = Stub(statusCode: 200, body: Data("[]".utf8))
    nonisolated(unsafe) static var lastRequestURL: URL?

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        Self.lastRequestURL = request.url
        let response = HTTPURLResponse(
            url: request.url!, statusCode: Self.stub.statusCode, httpVersion: "HTTP/1.1", headerFields: nil
        )!
        client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: Self.stub.body)
        client?.urlProtocolDidFinishLoading(self)
    }

    override func stopLoading() {}
}

@Suite(.serialized)
struct URLSessionEventsAPITests {
    private let baseURL = URL(string: "https://api.example.test")!

    /// Session éphémère dont tout le trafic passe par `StubURLProtocol`.
    private func makeAPI(statusCode: Int = 200, json: String, baseURL: URL? = nil) -> URLSessionEventsAPI {
        StubURLProtocol.stub = .init(statusCode: statusCode, body: Data(json.utf8))
        StubURLProtocol.lastRequestURL = nil
        let configuration = URLSessionConfiguration.ephemeral
        configuration.protocolClasses = [StubURLProtocol.self]
        return URLSessionEventsAPI(baseURL: baseURL ?? self.baseURL, session: URLSession(configuration: configuration))
    }

    @Test func decodesContractConformingEvents() async throws {
        // Arrange
        let api = makeAPI(json: """
        [
          {"id": "evt_1", "name": "Nuit Fluo", "organizerId": "org_1", "startDate": "2027-01-15T08:00:00Z",
           "location": "Valence", "capacity": 18, "status": "published", "description": null},
          {"id": "evt_2", "name": "Afterwork jeux", "organizerId": "org_2", "startDate": "2027-01-15T09:00:00Z"}
        ]
        """)

        // Act
        let events = try await api.fetchEvents()

        // Assert
        #expect(events == [
            Event(id: "evt_1", name: "Nuit Fluo", organizerId: "org_1",
                  startDate: Date(timeIntervalSince1970: 1_800_000_000),
                  location: "Valence", capacity: 18, status: .published),
            Event(id: "evt_2", name: "Afterwork jeux", organizerId: "org_2",
                  startDate: Date(timeIntervalSince1970: 1_800_003_600),
                  location: nil, capacity: nil, status: nil),
        ])
    }

    @Test func decodesDatesWithAndWithoutFractionalSeconds() async throws {
        // Arrange
        let api = makeAPI(json: """
        [
          {"id": "1", "name": "Avec fraction", "organizerId": "org_1", "startDate": "2027-01-15T08:00:00.250Z"},
          {"id": "2", "name": "Sans fraction", "organizerId": "org_1", "startDate": "2027-01-15T08:00:00Z"}
        ]
        """)

        // Act
        let events = try await api.fetchEvents()

        // Assert
        #expect(events.map(\.startDate) == [
            Date(timeIntervalSince1970: 1_800_000_000.25),
            Date(timeIntervalSince1970: 1_800_000_000),
        ])
    }

    @Test func failsToDecodeInvalidDate() async {
        // Arrange
        let api = makeAPI(json: """
        [{"id": "1", "name": "Nuit Fluo", "organizerId": "org_1", "startDate": "15/01/2027 08:00"}]
        """)

        // Act
        let error = await #expect(throws: DecodingError.self) { try await api.fetchEvents() }

        // Assert : l'échec vient bien de la date, pas d'un autre champ
        guard case .dataCorrupted(let context) = error else {
            Issue.record("dataCorrupted attendu, obtenu : \(String(describing: error))")
            return
        }
        #expect(context.codingPath.last?.stringValue == "startDate")
    }

    @Test func throwsBadServerResponseOnHTTP500() async {
        // Arrange : le corps est un JSON valide, seul le statut doit faire échouer
        let api = makeAPI(statusCode: 500, json: "[]")

        // Act & Assert
        await #expect(throws: URLError(.badServerResponse)) { try await api.fetchEvents() }
    }

    @Test func failsToDecodeInvalidJSON() async {
        // Arrange
        let api = makeAPI(json: "{ pas du json")

        // Act
        let error = await #expect(throws: DecodingError.self) { try await api.fetchEvents() }

        // Assert : JSON mal formé, pas un champ manquant ni un type faux
        guard case .dataCorrupted = error else {
            Issue.record("dataCorrupted attendu, obtenu : \(String(describing: error))")
            return
        }
    }

    @Test func failsToDecodeWhenRequiredFieldIsMissing() async {
        // Arrange : organizerId est required dans le schéma Event
        let api = makeAPI(json: """
        [{"id": "1", "name": "Nuit Fluo", "startDate": "2027-01-15T08:00:00Z"}]
        """)

        // Act
        let error = await #expect(throws: DecodingError.self) { try await api.fetchEvents() }

        // Assert
        guard case .keyNotFound(let key, _) = error else {
            Issue.record("keyNotFound attendu, obtenu : \(String(describing: error))")
            return
        }
        #expect(key.stringValue == "organizerId")
    }

    @Test func throwsBadURLWhenBaseURLIsMissing() async {
        // Arrange
        let api = URLSessionEventsAPI(baseURL: nil, session: makeAPI(json: "[]").session)

        // Act & Assert
        await #expect(throws: URLError(.badURL)) { try await api.fetchEvents() }
        #expect(StubURLProtocol.lastRequestURL == nil)
    }

    @Test func requestsEventsPathUnderBaseURL() async throws {
        // Arrange
        let api = makeAPI(json: "[]", baseURL: URL(string: "https://api.example.test/v1")!)

        // Act
        _ = try await api.fetchEvents()

        // Assert
        #expect(StubURLProtocol.lastRequestURL?.absoluteString == "https://api.example.test/v1/events")
    }
}
