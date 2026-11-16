import SwiftUI

/// Écran « iOS 1 · Accueil » de la maquette.
struct HomeView: View {
    @State private var viewModel: HomeViewModel
    @State private var query = ""

    init(api: EventsAPI) {
        _viewModel = State(initialValue: HomeViewModel(api: api))
    }

    private var filteredEvents: [Event] {
        guard !query.isEmpty else { return viewModel.events }
        return viewModel.events.filter {
            $0.name.localizedCaseInsensitiveContains(query)
                || ($0.location ?? "").localizedCaseInsensitiveContains(query)
        }
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    VStack(alignment: .leading, spacing: 0) {
                        HomeHeader()
                        Text("On fait quoi\n\(Text("ce soir").foregroundStyle(Theme.primary)) ?")
                            .font(.system(size: 30, weight: .heavy, design: .rounded))
                            .foregroundStyle(Theme.text)
                            .padding(.top, 16)
                        SearchBar(query: $query).padding(.top, 16)
                        TonightHeader().padding(.top, 22)
                    }
                    .padding(.horizontal, 20)

                    tonightContent.padding(.top, 12)

                    CategoriesSection()
                        .padding(.horizontal, 20)
                        .padding(.top, 22)
                }
                .padding(.bottom, 120)
            }
            .scrollIndicators(.hidden)
            .refreshable { await viewModel.load() }

            FloatingTabBar()
        }
        .background(Theme.bg.ignoresSafeArea())
        .background(alignment: .topTrailing) {
            Ellipse()
                .fill(Theme.primarySoft)
                .frame(width: 290, height: 290)
                .offset(x: 110, y: -120)
                .ignoresSafeArea()
        }
        .task { await viewModel.load() }
    }

    @ViewBuilder
    private var tonightContent: some View {
        if viewModel.isLoading && viewModel.events.isEmpty {
            ProgressView().frame(maxWidth: .infinity, minHeight: 200)
        } else if let error = viewModel.error {
            VStack(spacing: 10) {
                Label("Impossible de charger les événements", systemImage: "wifi.exclamationmark")
                    .font(.system(.subheadline, design: .rounded, weight: .bold))
                Text(error).font(.caption).foregroundStyle(Theme.muted)
                Button("Réessayer") { Task { await viewModel.load() } }
                    .buttonStyle(.borderedProminent)
                    .tint(Theme.primary)
            }
            .foregroundStyle(Theme.text)
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity, minHeight: 200)
            .padding(.horizontal, 20)
        } else if filteredEvents.isEmpty {
            Text("Aucun événement")
                .font(.system(.subheadline, design: .rounded, weight: .bold))
                .foregroundStyle(Theme.muted)
                .frame(maxWidth: .infinity, minHeight: 200)
        } else {
            ScrollView(.horizontal) {
                LazyHStack(spacing: 12) {
                    ForEach(Array(filteredEvents.enumerated()), id: \.element.id) { index, event in
                        EventCard(event: event, tone: index)
                    }
                }
            }
            .contentMargins(.horizontal, 20, for: .scrollContent)
            .scrollIndicators(.hidden)
        }
    }
}

// MARK: - Header

private struct HomeHeader: View {
    var body: some View {
        HStack {
            Button {} label: {
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Image(systemName: "mappin.and.ellipse").foregroundStyle(Theme.accentText)
                        Text("Valence").font(.system(size: 17, weight: .heavy))
                        Image(systemName: "chevron.down").font(.system(size: 12, weight: .bold))
                    }
                    Text("Autour de toi · 10 km")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(Theme.muted)
                }
                .foregroundStyle(Theme.text)
            }
            Spacer()
            HStack(spacing: 10) {
                Button {} label: {
                    Image(systemName: "bell")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.text)
                        .frame(width: 44, height: 44)
                        .background(Theme.surface, in: Circle())
                        .overlay(Circle().stroke(Theme.border))
                        .overlay(alignment: .topTrailing) {
                            Circle().fill(Theme.accent)
                                .frame(width: 9, height: 9)
                                .overlay(Circle().stroke(Theme.surface, lineWidth: 2))
                                .padding(10)
                        }
                }
                .accessibilityLabel("Notifications")
                Button {} label: {
                    Image(systemName: "person.fill")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(Theme.onPrimary)
                        .frame(width: 44, height: 44)
                        .background(Theme.primary, in: Circle())
                }
                .accessibilityLabel("Mon profil")
            }
        }
    }
}

private struct SearchBar: View {
    @Binding var query: String

    var body: some View {
        HStack(spacing: 8) {
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(Theme.muted)
                TextField("Concert, atelier, lieu…", text: $query)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(Theme.text)
                    .submitLabel(.search)
            }
            .padding(.horizontal, 16)
            .frame(height: 52)
            .background(Theme.surface, in: Capsule())
            .overlay(Capsule().stroke(Theme.border))

            Button {} label: {
                Image(systemName: "slider.horizontal.3")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(Theme.bg)
                    .frame(width: 52, height: 52)
                    .background(Theme.text, in: Circle())
            }
            .accessibilityLabel("Filtres")
        }
    }
}

private struct TonightHeader: View {
    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            HStack(spacing: 8) {
                Circle().fill(Theme.accentText).frame(width: 9, height: 9)
                Text("Ce soir")
                    .font(.system(size: 19, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.text)
            }
            Spacer()
            Button("Tout voir") {}
                .font(.system(size: 14, weight: .heavy))
                .foregroundStyle(Theme.primary)
        }
    }
}

// MARK: - Carte événement

private struct EventCard: View {
    let event: Event
    let tone: Int
    @State private var isFavorite = false

    private var cover: Color { tone.isMultiple(of: 2) ? Theme.primary : Theme.accentSoft }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ZStack(alignment: .topLeading) {
                Rectangle().fill(cover)
                Ellipse().fill(tone.isMultiple(of: 2) ? Theme.accent : Theme.primary)
                    .frame(width: 170, height: 170)
                    .offset(x: 150, y: -50)
                Ellipse().fill(Theme.sky)
                    .frame(width: 130, height: 130)
                    .offset(x: -30, y: 80)

                Text(event.startDate, format: .dateTime.hour().minute())
                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                    .foregroundStyle(Theme.text)
                    .padding(.horizontal, 11).padding(.vertical, 5)
                    .background(Theme.surface, in: Capsule())
                    .padding(10)

                Button { isFavorite.toggle() } label: {
                    Image(systemName: isFavorite ? "heart.fill" : "heart")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(Theme.accentText)
                        .frame(width: 40, height: 40)
                        .background(Theme.surface, in: Circle())
                }
                .accessibilityLabel(isFavorite ? "Retirer des favoris" : "Ajouter aux favoris")
                .frame(maxWidth: .infinity, alignment: .topTrailing)
                .padding(6)
            }
            .frame(height: 150)
            .clipShape(UnevenRoundedRectangle(topLeadingRadius: 26, bottomLeadingRadius: 6,
                                              bottomTrailingRadius: 26, topTrailingRadius: 26))

            VStack(alignment: .leading, spacing: 4) {
                Text(event.name)
                    .font(.system(size: 17, weight: .bold, design: .rounded))
                    .lineLimit(1)
                Text(event.location ?? "Lieu à venir")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.muted)
                    .lineLimit(1)
                if let capacity = event.capacity {
                    Text("\(capacity) places")
                        .font(.system(size: 13, weight: .heavy))
                        .foregroundStyle(Theme.accentText)
                        .padding(.top, 4)
                }
            }
            .foregroundStyle(Theme.text)
            .padding(.horizontal, 8)
            .padding(.bottom, 8)
        }
        .padding(8)
        .frame(width: 286)
        .background(Theme.surface, in: UnevenRoundedRectangle(topLeadingRadius: 32, bottomLeadingRadius: 10,
                                                              bottomTrailingRadius: 32, topTrailingRadius: 32))
        .overlay(
            UnevenRoundedRectangle(topLeadingRadius: 32, bottomLeadingRadius: 10,
                                   bottomTrailingRadius: 32, topTrailingRadius: 32)
                .stroke(Theme.border)
        )
    }
}

// MARK: - Catégories

private struct CategoriesSection: View {
    private struct Category: Identifiable {
        let title: String
        let symbol: String
        let accent: Bool
        let radii: (CGFloat, CGFloat, CGFloat, CGFloat)
        var id: String { title }
    }

    private let categories = [
        Category(title: "Musique", symbol: "music.note", accent: false, radii: (24, 32, 21, 35)),
        Category(title: "Ateliers", symbol: "paintpalette", accent: true, radii: (35, 21, 34, 22)),
        Category(title: "Sport", symbol: "figure.run", accent: false, radii: (20, 36, 20, 36)),
        Category(title: "Expos", symbol: "photo.artframe", accent: false, radii: (31, 25, 22, 34)),
        Category(title: "Food", symbol: "fork.knife", accent: true, radii: (24, 32, 21, 35)),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Envie de…")
                .font(.system(size: 19, weight: .bold, design: .rounded))
                .foregroundStyle(Theme.text)
            HStack(alignment: .top, spacing: 8) {
                ForEach(categories) { category in
                    Button {} label: {
                        VStack(spacing: 6) {
                            Image(systemName: category.symbol)
                                .font(.system(size: 22, weight: .semibold))
                                .foregroundStyle(category.accent ? Theme.accentText : Theme.primary)
                                .frame(width: 56, height: 56)
                                .background(
                                    category.accent ? Theme.accentSoft : Theme.primarySoft,
                                    in: UnevenRoundedRectangle(
                                        topLeadingRadius: category.radii.0,
                                        bottomLeadingRadius: category.radii.3,
                                        bottomTrailingRadius: category.radii.2,
                                        topTrailingRadius: category.radii.1
                                    )
                                )
                            Text(category.title)
                                .font(.system(size: 12, weight: .heavy))
                                .foregroundStyle(Theme.text)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
            }
        }
    }
}

// MARK: - Barre d'onglets

private struct FloatingTabBar: View {
    private let items: [(symbol: String, label: String)] = [
        ("safari", "Découvrir"), ("map", "Carte"), ("ticket", "Mes billets"), ("heart", "Favoris"),
    ]

    var body: some View {
        HStack {
            ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                Button {} label: {
                    Image(systemName: item.symbol)
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundStyle(index == 0 ? Theme.onPrimary : Theme.muted)
                        .frame(width: 52, height: 52)
                        .background {
                            if index == 0 { Ellipse().fill(Theme.primary) }
                        }
                        .frame(maxWidth: .infinity)
                }
                .accessibilityLabel(item.label)
            }
        }
        .frame(height: 68)
        .background(Theme.surface, in: Capsule())
        .overlay(Capsule().stroke(Theme.border))
        .shadow(color: .black.opacity(0.12), radius: 20, y: 16)
        .padding(.horizontal, 20)
        .padding(.bottom, 8)
    }
}

#Preview {
    struct Sample: EventsAPI {
        func fetchEvents() async throws -> [Event] {
            [
                Event(id: "1", name: "Nuit Fluo", organizerId: "org_1", startDate: .now,
                      location: "Valence centre", capacity: 18, status: .published),
                Event(id: "2", name: "Afterwork jeux", organizerId: "org_1", startDate: .now,
                      location: "Le Comptoir", capacity: nil, status: .published),
            ]
        }
    }
    return HomeView(api: Sample())
}
