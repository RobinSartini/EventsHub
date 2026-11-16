import SwiftUI

struct HomeView: View {
    @State private var viewModel: HomeViewModel

    init(api: EventsAPI) {
        _viewModel = State(initialValue: HomeViewModel(api: api))
    }

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.events.isEmpty {
                    ProgressView("Chargement…")
                } else if let error = viewModel.error {
                    ContentUnavailableView(
                        "Impossible de charger les événements",
                        systemImage: "wifi.exclamationmark",
                        description: Text(error)
                    )
                } else if viewModel.events.isEmpty {
                    ContentUnavailableView("Aucun événement", systemImage: "calendar")
                } else {
                    List(viewModel.events) { EventRow(event: $0) }
                }
            }
            .navigationTitle("Événements")
            .task { await viewModel.load() }
            .refreshable { await viewModel.load() }
        }
    }
}

private struct EventRow: View {
    let event: Event

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(event.name).font(.headline)
            Text(event.startDate, format: .dateTime.day().month(.wide).year().hour().minute())
                .font(.subheadline)
                .foregroundStyle(.secondary)
            if let location = event.location {
                Label(location, systemImage: "mappin.and.ellipse")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 2)
    }
}

#Preview {
    struct Sample: EventsAPI {
        func fetchEvents() async throws -> [Event] {
            [
                Event(id: "1", name: "Hackathon 2026", startDate: .now.addingTimeInterval(86_400),
                      location: "Paris", capacity: 120, status: "published"),
                Event(id: "2", name: "Meetup Swift", startDate: .now.addingTimeInterval(259_200),
                      location: "Lyon", capacity: 40, status: "published"),
            ]
        }
    }
    return HomeView(api: Sample())
}
