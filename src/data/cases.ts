// Реальные заказы кондитеров — из сторис Sloyka «для тортов».
// Когда появится админка, кейсы будут добавляться там (модель Case в prisma/schema.prisma).

export type CaseStudy = {
  id: string;
  photo: string;
  model: string;
  productSlug: string;
  colors: string;
  price: number;
  logo?: number;
  client: string;
};

export const cases: CaseStudy[] = [
  { id: "marble-xl", photo: "/photos/case-marble-xl.webp", model: "Marble XL, Ø30", productSlug: "classic-marble", colors: "слоновая кость", price: 3900, logo: 500, client: "Jul.cake" },
  { id: "muffin-xl", photo: "/photos/case-muffin-xl.webp", model: "Muffin XL, Ø30", productSlug: "classic-muffin", colors: "слоновая кость / малиновый йогурт", price: 3800, logo: 500, client: "Блок Арт Десерт" },
  { id: "muffin-255", photo: "/photos/case-muffin-255.webp", model: "Muffin, Ø25,5", productSlug: "classic-muffin", colors: "слоновая кость", price: 2600, logo: 500, client: "Yanni Bakery" },
  { id: "marble-255", photo: "/photos/case-marble-255.webp", model: "Marble, Ø25,5", productSlug: "classic-marble", colors: "латте", price: 2800, client: "" },
  { id: "modular-16", photo: "/photos/case-modular-16.webp", model: "Modular, Ø16", productSlug: "modular", colors: "карамель, малиновый йогурт, тёмно-зелёный", price: 1500, client: "" },
  { id: "marble-24", photo: "/photos/case-marble-24.webp", model: "Marble, Ø24", productSlug: "classic-marble", colors: "серый / фисташка", price: 2400, logo: 500, client: "Sweet Tooth" },
];
