const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const categories = {
  starters: {
    title: 'Starters',
    items: [
      'Veg Spring Rolls – ₹199',
      'Paneer Tikka – ₹249',
      'Chicken Tikka – ₹279',
      'Chicken Wings (6 pcs) – ₹299',
      'French Fries – ₹149',
      'Loaded Nachos (Veg) – ₹199',
      'Loaded Nachos (Chicken) – ₹249',
    ],
  },
  burgers: {
    title: 'Burgers',
    items: [
      'Classic Veg Burger – ₹179',
      'Paneer Burger – ₹199',
      'Chicken Burger – ₹219',
      'Double Chicken Burger – ₹299',
    ],
  },
  pizzas: {
    title: 'Pizzas (8 inch)',
    items: [
      'Margherita – ₹199',
      'Farm Fresh (Veg) – ₹249',
      'Chicken Tikka Pizza – ₹279',
      'BBQ Chicken Pizza – ₹299',
    ],
  },
  sandwiches: {
    title: 'Sandwiches & Wraps',
    items: [
      'Veg Club Sandwich – ₹179',
      'Chicken Club Sandwich – ₹219',
      'Paneer Wrap – ₹189',
      'Chicken Wrap – ₹219',
    ],
  },
  pasta: {
    title: 'Pasta',
    items: [
      'Penne Arrabiata (Veg) – ₹219',
      'Alfredo Pasta (Veg) – ₹229',
      'Chicken Alfredo Pasta – ₹269',
      'Chicken Penne Arrabiata – ₹249',
    ],
  },
  rice: {
    title: 'Rice Bowls',
    items: [
      'Veg Fried Rice – ₹179',
      'Chicken Fried Rice – ₹219',
      'Egg Fried Rice – ₹189',
    ],
  },
  beverages: {
    title: 'Beverages',
    items: [
      'Cold Coffee – ₹149',
      'Iced Tea (Lemon/Peach) – ₹129',
      'Fresh Lime Soda – ₹99',
      'Mango Shake – ₹159',
      'Oreo Shake – ₹169',
      'Brownie Shake – ₹179',
      'Soft Drinks (Coke/Sprite/Fanta) – ₹49',
      'Water Bottle – ₹20',
    ],
  },
  desserts: {
    title: 'Desserts',
    items: [
      'Brownie with Ice Cream – ₹199',
      'Chocolate Lava Cake – ₹229',
    ],
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('menu')
    .setDescription('View the RacingPoint cafe menu')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Menu category to view')
        .addChoices(
          { name: 'Starters', value: 'starters' },
          { name: 'Burgers', value: 'burgers' },
          { name: 'Pizzas', value: 'pizzas' },
          { name: 'Sandwiches & Wraps', value: 'sandwiches' },
          { name: 'Pasta', value: 'pasta' },
          { name: 'Rice Bowls', value: 'rice' },
          { name: 'Beverages', value: 'beverages' },
          { name: 'Desserts', value: 'desserts' },
        )
    ),
  async execute(interaction) {
    const category = interaction.options.getString('category');

    if (category) {
      const cat = categories[category];
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle(`Cafe Menu — ${cat.title}`)
        .setDescription(cat.items.join('\n'))
        .setFooter({ text: 'RacingPoint eSports and Cafe — Hyderabad' });

      await interaction.reply({ embeds: [embed] });
    } else {
      // Show all categories overview
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('RacingPoint Cafe Menu')
        .setDescription('Choose a category to see the full menu:')
        .addFields(
          Object.entries(categories).map(([key, cat]) => ({
            name: cat.title,
            value: `${cat.items.length} items — use \`/menu ${key}\``,
            inline: true,
          }))
        )
        .setFooter({ text: 'RacingPoint eSports and Cafe — Hyderabad' });

      await interaction.reply({ embeds: [embed] });
    }
  },
};
