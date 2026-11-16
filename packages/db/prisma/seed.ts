import prisma from "../src/index";

const organizer = {
  id: "seed-organizer",
  name: "Organisateur Démo",
  email: "organisateur@example.com",
};

const categories = [
  { name: "Musique", slug: "musique" },
  { name: "Sport", slug: "sport" },
  { name: "Théâtre", slug: "theatre" },
  { name: "Atelier", slug: "atelier" },
];

const cities = [
  { city: "Valence", location: "Le Cargo" },
  { city: "Lyon", location: "Halle Tony Garnier" },
  { city: "Grenoble", location: "Palais des Sports" },
  { city: "Paris", location: "La Cigale" },
  { city: "Marseille", location: "Le Dôme" },
];

const titles = ["Concert", "Tournoi", "Pièce", "Atelier créatif", "Festival", "Soirée jazz"];

await prisma.user.upsert({ where: { id: organizer.id }, update: {}, create: organizer });

const categoryIds = await Promise.all(
  categories.map(async (category) => {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    return saved.id;
  }),
);

await prisma.event.deleteMany({ where: { organizerId: organizer.id } });

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

await prisma.event.createMany({
  data: Array.from({ length: 30 }, (_, i) => {
    const place = cities[i % cities.length]!;
    return {
      name: `${titles[i % titles.length]} #${i + 1}`,
      description: `Événement de démonstration n°${i + 1} à ${place.city}.`,
      categoryId: categoryIds[i % categoryIds.length],
      organizerId: organizer.id,
      startDate: new Date(now + (i + 1) * 2 * day),
      location: place.location,
      city: place.city,
      capacity: 50 + (i % 5) * 50,
      priceCents: (i % 4) * 1000,
      isAccessible: i % 2 === 0,
      isKidFriendly: i % 3 === 0,
      status: i % 10 === 9 ? "cancelled" : "published",
    };
  }),
});

console.log(`Seeded 30 events (27 published, 3 cancelled) for ${organizer.email}`);
await prisma.$disconnect();
