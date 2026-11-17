import Foundation
import Testing
@testable import EventsHub

extension Networking {
@Suite struct URLSessionEventsAPITests {
    private let eventsJSON = """
    [{"id":"e1","name":"A","organizerId":"o1","startDate":"2026-11-16T10:00:00.500Z","location":null,"capacity":10,"status":"published"},
     {"id":"e2","name":"B","organizerId":"o1","startDate":"2026-11-16T10:00:00Z"}]
    """

    @Test func fetchEventsHitsEventsPathAndDecodes() async throws {
        let api = URLSessionEventsAPI(client: makeStubClient(body: eventsJSON))
        let events = try await api.fetchEvents()
        #expect(StubURLProtocol.lastRequest?.url?.path == "/events")
        #expect(StubURLProtocol.lastRequest?.httpMethod == "GET")
        #expect(events.map(\.id) == ["e1", "e2"])
        #expect(events[0].startDate.timeIntervalSince(events[1].startDate) == 0.5)
        #expect(events[0].status == .published)
    }

    @Test func fetchEventsForwardsClientOrigin() async throws {
        let api = URLSessionEventsAPI(client: makeStubClient(body: "[]", origin: "http://localhost:3000"))
        _ = try await api.fetchEvents()
        #expect(StubURLProtocol.lastRequest?.value(forHTTPHeaderField: "Origin") == "http://localhost:3000")
    }

    @Test func serverErrorIsAPIErrorServer() async {
        let api = URLSessionEventsAPI(client: makeStubClient(status: 500))
        do {
            _ = try await api.fetchEvents()
            Issue.record("Aucune erreur levée")
        } catch {
            #expect(error as? APIError == .server)
        }
    }
}
}
