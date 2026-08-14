export const site = {
  name: 'Awan Collection',
  tagline: 'Quality You Trust, Style You Desire',
  whatsapp: {
    phoneNumber: '923110268033',
    phoneDisplay: '0311-0268033',
    defaultMessage: 'Hi Awan Collection, I want to inquire about your products.',
  },
  categories: [
    { name: 'Footwear', slug: 'cat-footwear' },
    { name: "Men's Wear", slug: 'cat-mens-wear' },
    { name: "Kids Wear", slug: 'cat-kids-wear' },
    { name: 'Ladies Fancy Dresses', slug: 'cat-dresses' },
    { name: "Women's Bags", slug: 'cat-bags' },
    { name: 'Watches & Jewelry', slug: 'cat-jewelry' },
    { name: 'Household Items', slug: 'cat-household' },
    { name: 'Cosmetics & Beauty', slug: 'cat-cosmetics' },
  ],
} as const;

export interface SiteCategory {
  name: string;
  slug: string;
}