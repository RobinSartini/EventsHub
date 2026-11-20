import Foundation

/// Implémentation réseau de `GET /events` (contrat/openapi.yaml), couche fine sur `APIClient`.
struct URLSessionEventsAPI: EventsAPI {
    var client: APIClient

    init(client: APIClient = APIClient()) {
        self.client = client
    }

    init(baseURL: URL?, session: URLSession = .shared) {
        self.client = APIClient(baseURL: baseURL, session: session)
    }

    func fetchEvents() async throws -> [Event] {
        try await client.send("GET", path: "events")
    }
}
