import Foundation
import Observation

@MainActor
@Observable
final class HomeViewModel {
    private(set) var events: [Event] = []
    private(set) var isLoading = false
    private(set) var error: String?

    private let api: EventsAPI

    init(api: EventsAPI) {
        self.api = api
    }

    func load() async {
        isLoading = true
        error = nil
        defer { isLoading = false }
        do {
            events = try await api.fetchEvents()
        } catch {
            events = []
            self.error = error.localizedDescription
        }
    }
}
