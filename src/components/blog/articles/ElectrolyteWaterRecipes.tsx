import styles from "./electrolyte-water-recipes.module.css";

type ElectrolyteTag = "k" | "mg" | "na" | "ca";

type Recipe = {
  number: string;
  emoji: string;
  visualTitle: string;
  visualTagline: string;
  visualClass: string;
  title: string;
  subtitle: string;
  tags: ElectrolyteTag[];
  ingredients: Array<{ amount: string; item: string }>;
  method: string;
  benefits: string;
};

const minerals = [
  {
    icon: "🍌",
    name: "Potassium",
    symbol: "K⁺",
    desc: "Regulates fluid balance, supports heart rhythm, prevents muscle cramps. Found abundantly in citrus, bananas, and berries.",
  },
  {
    icon: "🌿",
    name: "Magnesium",
    symbol: "Mg²⁺",
    desc: "Powers over 300 enzymatic reactions, supports nerve function and sleep. Present in leafy herbs, seeds, and some fruits.",
  },
  {
    icon: "🧂",
    name: "Sodium",
    symbol: "Na⁺",
    desc: "Maintains fluid balance and blood pressure, supports nerve signals. A small pinch of sea salt is all you need naturally.",
  },
  {
    icon: "🥛",
    name: "Calcium",
    symbol: "Ca²⁺",
    desc: "Essential for muscle contraction, bone health, and cell signaling. Citrus fruits, figs, and fortified waters contribute meaningfully.",
  },
];

const recipes: Recipe[] = [
  {
    number: "01",
    emoji: "🍋🥒",
    visualTitle: "The Classic Reviver",
    visualTagline: "Clean, crisp, endlessly refreshing",
    visualClass: styles.visual1,
    title: "Lemon, Cucumber & Mint Water",
    subtitle: "A timeless combination that hydrates, alkalizes, and cools.",
    tags: ["k", "mg", "na"],
    ingredients: [
      { amount: "1 whole", item: "lemon, thinly sliced" },
      { amount: "½ medium", item: "cucumber, thinly sliced" },
      { amount: "10–12 leaves", item: "fresh mint" },
      { amount: "⅛ tsp", item: "sea salt or Himalayan pink salt" },
      { amount: "1 tsp", item: "raw honey (optional)" },
      { amount: "1 liter", item: "filtered water" },
    ],
    method:
      "Combine all ingredients in a large pitcher. Gently muddle the mint to release its oils. Refrigerate for at least 2 hours before serving over ice. Best consumed within 24 hours.",
    benefits:
      "✦ Lemon adds vitamin C & potassium · Cucumber provides silica & trace minerals · Mint aids digestion",
  },
  {
    number: "02",
    emoji: "🍊🫚",
    visualTitle: "The Athlete's Edge",
    visualTagline: "Post-workout replenishment",
    visualClass: styles.visual2,
    title: "Orange, Coconut Water & Sea Salt",
    subtitle: "Nature's sports drink — built for recovery after real effort.",
    tags: ["k", "mg", "na", "ca"],
    ingredients: [
      { amount: "500 ml", item: "pure coconut water (unsweetened)" },
      { amount: "500 ml", item: "filtered water" },
      { amount: "Juice of 2", item: "large navel oranges" },
      { amount: "¼ tsp", item: "sea salt" },
      { amount: "1 tsp", item: "raw honey or maple syrup" },
      { amount: "A few", item: "orange slices to garnish" },
    ],
    method:
      "Combine coconut water and filtered water. Squeeze in orange juice, add sea salt and honey. Stir well until dissolved. Serve cold immediately after exercise or refrigerate for up to 48 hours.",
    benefits: "✦ Coconut water provides natural potassium & magnesium · Orange adds vitamin C & flavonoids",
  },
  {
    number: "03",
    emoji: "🫐🍋",
    visualTitle: "The Antioxidant Wave",
    visualTagline: "Hydrate and protect",
    visualClass: styles.visual3,
    title: "Blueberry, Lemon & Basil Water",
    subtitle: "Electrolytes meet polyphenols for deep cellular hydration.",
    tags: ["k", "mg", "ca"],
    ingredients: [
      { amount: "1 cup", item: "fresh blueberries, lightly crushed" },
      { amount: "1 whole", item: "lemon, sliced" },
      { amount: "6–8 leaves", item: "fresh basil" },
      { amount: "⅛ tsp", item: "sea salt" },
      { amount: "1 tsp", item: "raw honey" },
      { amount: "1 liter", item: "filtered water" },
    ],
    method:
      "Lightly crush blueberries with the back of a spoon to release their juice and minerals. Add all ingredients to a pitcher, stir gently, and refrigerate for 3–4 hours. Strain before serving if preferred.",
    benefits: "✦ Blueberries are rich in manganese & vitamin K · Basil contributes trace magnesium & calcium",
  },
  {
    number: "04",
    emoji: "🍓🌹",
    visualTitle: "The Morning Reset",
    visualTagline: "Wake up your cells gently",
    visualClass: styles.visual4,
    title: "Strawberry, Rose Water & Pink Salt",
    subtitle: "A floral, feminine hydration ritual with real mineral depth.",
    tags: ["k", "mg", "na"],
    ingredients: [
      { amount: "1 cup", item: "fresh strawberries, halved" },
      { amount: "1 tbsp", item: "food-grade rose water" },
      { amount: "Juice of 1", item: "lemon" },
      { amount: "¼ tsp", item: "Himalayan pink salt" },
      { amount: "1 tsp", item: "raw honey" },
      { amount: "1 liter", item: "filtered water" },
    ],
    method:
      "Muddle strawberries gently in the bottom of a pitcher. Add remaining ingredients and stir to combine. Infuse for 2–4 hours in the refrigerator. Serve over ice with a fresh strawberry garnish.",
    benefits: "✦ Strawberries provide potassium & vitamin C · Himalayan salt contains 84 trace minerals",
  },
  {
    number: "05",
    emoji: "🍋🫚",
    visualTitle: "The Golden Hour",
    visualTagline: "Anti-inflammatory hydration",
    visualClass: styles.visual5,
    title: "Lemon, Ginger, Turmeric & Honey Water",
    subtitle: "A warming, healing blend that hydrates and fights inflammation simultaneously.",
    tags: ["k", "mg", "na"],
    ingredients: [
      { amount: "Juice of 2", item: "lemons" },
      { amount: "1-inch piece", item: "fresh ginger, grated" },
      { amount: "½ tsp", item: "ground turmeric (or 1-inch fresh)" },
      { amount: "1 tbsp", item: "raw honey" },
      { amount: "¼ tsp", item: "sea salt" },
      { amount: "Pinch", item: "black pepper (activates turmeric)" },
      { amount: "1 liter", item: "warm or room temp water" },
    ],
    method:
      "Combine all ingredients in a pitcher, stirring until honey is dissolved. For maximum benefit, allow the ginger to steep for 20 minutes. Can be served warm in the morning or chilled throughout the day.",
    benefits: "✦ Turmeric + black pepper: powerful anti-inflammatory duo · Ginger supports gut health & digestion",
  },
  {
    number: "06",
    emoji: "🍉🌿",
    visualTitle: "The Summer Soaker",
    visualTagline: "Heat-day hydration perfected",
    visualClass: styles.visual6,
    title: "Watermelon, Lime & Fresh Mint",
    subtitle: "Over 90% water by nature — watermelon is hydration in fruit form.",
    tags: ["k", "mg", "ca"],
    ingredients: [
      { amount: "3 cups", item: "fresh watermelon, cubed & blended" },
      { amount: "Juice of 2", item: "limes" },
      { amount: "10 leaves", item: "fresh spearmint" },
      { amount: "⅛ tsp", item: "sea salt" },
      { amount: "1 tsp", item: "honey (optional)" },
      { amount: "500 ml", item: "filtered water" },
    ],
    method:
      "Blend watermelon until smooth and pour through a fine strainer into a pitcher. Add lime juice, sea salt, and filtered water. Muddle mint and add. Stir and serve immediately over ice, or refrigerate for up to 24 hours.",
    benefits:
      "✦ Watermelon contains lycopene, potassium & citrulline, which supports circulation & muscle recovery",
  },
];

const tips = [
  {
    title: "Always add a pinch of salt",
    body: "Sodium is what helps your cells actually absorb water. Without it, you can drink all day and still feel dehydrated. A tiny pinch of sea salt or Himalayan salt in any infusion dramatically improves uptake.",
  },
  {
    title: "Use filtered or spring water",
    body: "Tap water often contains chlorine and fluoride that can interfere with mineral absorption. Filtered or natural spring water lets the electrolytes from your fruit work unimpeded.",
  },
  {
    title: "Infuse overnight for best results",
    body: "The longer the fruit sits in water, the more minerals and phytonutrients it releases. Overnight cold infusions (8–12 hours) yield significantly richer electrolyte content than short steeps.",
  },
  {
    title: "Don't skip the rind or peel",
    body: "Lemon, lime, and orange peel contains concentrated flavonoids, calcium, and potassium. Leaving thin slices with rind in your infusions adds meaningful mineral value.",
  },
  {
    title: "Pair with whole food meals",
    body: "These infusions are designed to complement a balanced diet, not replace it. Eating potassium-rich foods alongside your hydration water creates a synergistic electrolyte effect.",
  },
  {
    title: "When to drink matters",
    body: "For workouts, drink 30 minutes before exercise and immediately after. For illness recovery, sip consistently throughout the day rather than in large amounts. First thing in the morning is ideal for daily hydration.",
  },
];

const tagClass: Record<ElectrolyteTag, string> = {
  k: styles.eTagK,
  mg: styles.eTagMg,
  na: styles.eTagNa,
  ca: styles.eTagCa,
};

const tagLabel: Record<ElectrolyteTag, string> = {
  k: "Potassium",
  mg: "Magnesium",
  na: "Sodium",
  ca: "Calcium",
};

export function ElectrolyteWaterRecipesArticle() {
  return (
    <article className={styles.article}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Natural Hydration · Whole Food Electrolytes</p>
        <h1 className={styles.heroTitle}>Drink from nature.</h1>
        <p className={styles.heroSub}>
          Six fruit-infused electrolyte waters your body was designed to absorb — no packets, no additives, no
          compromise.
        </p>
        <div className={styles.scrollHint}>
          <span>Explore</span>
          <div className={styles.scrollLine} />
        </div>
      </section>

      <div className={styles.introStrip}>
        <p>
          Your body needs <strong>sodium, potassium, magnesium,</strong> and <strong>calcium</strong> to stay hydrated
          and function. Fruit gives you all four — plus antioxidants, enzymes, and fiber that no electrolyte packet can
          replicate.
        </p>
      </div>

      <section className={styles.keySection}>
        <p className={styles.sectionLabel}>What you&apos;re replenishing</p>
        <div className={styles.mineralGrid}>
          {minerals.map((mineral) => (
            <div key={mineral.name} className={styles.mineralCard}>
              <div className={styles.mineralIcon}>{mineral.icon}</div>
              <div className={styles.mineralName}>{mineral.name}</div>
              <div className={styles.mineralSymbol}>{mineral.symbol}</div>
              <p className={styles.mineralDesc}>{mineral.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.recipesSection}>
        <div className={styles.recipesHeader}>
          <h2>The Recipes</h2>
          <span className={styles.recipeCount}>06 infusions</span>
        </div>

        {recipes.map((recipe, index) => (
          <div
            key={recipe.number}
            className={`${styles.recipeCard} ${index % 2 === 1 ? styles.recipeCardEven : ""}`}
          >
            <div className={`${styles.recipeVisual} ${recipe.visualClass}`}>
              <div className={styles.recipeEmoji}>{recipe.emoji}</div>
              <div className={styles.recipeVisualTitle}>{recipe.visualTitle}</div>
              <div className={styles.recipeVisualTagline}>{recipe.visualTagline}</div>
            </div>
            <div className={styles.recipeContent}>
              <div className={styles.recipeNumber}>Recipe {recipe.number}</div>
              <h3 className={styles.recipeTitle}>{recipe.title}</h3>
              <p className={styles.recipeSubtitle}>{recipe.subtitle}</p>
              <div className={styles.electrolyteTags}>
                {recipe.tags.map((tag) => (
                  <span key={tag} className={`${styles.eTag} ${tagClass[tag]}`}>
                    {tagLabel[tag]}
                  </span>
                ))}
              </div>
              <p className={styles.ingredientsTitle}>Ingredients — Makes 1 Liter</p>
              <ul className={styles.ingredientsList}>
                {recipe.ingredients.map((ingredient) => (
                  <li key={`${recipe.number}-${ingredient.item}`}>
                    <span className={styles.ingredientAmount}>{ingredient.amount}</span>
                    {ingredient.item}
                  </li>
                ))}
              </ul>
              <p className={styles.methodTitle}>Method</p>
              <p className={styles.methodText}>{recipe.method}</p>
              <div className={styles.benefitsBar}>{recipe.benefits}</div>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.tipsSection}>
        <div className={styles.tipsInner}>
          <p className={styles.sectionLabel}>Making it work</p>
          <h2>Tips for Maximum Mineral Absorption</h2>
          <div className={styles.tipsGrid}>
            {tips.map((tip, index) => (
              <div key={tip.title} className={styles.tipCard}>
                <div className={styles.tipNum}>{String(index + 1).padStart(2, "0")}</div>
                <h3>{tip.title}</h3>
                <p>{tip.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>
          These recipes are for general wellness and do not constitute medical advice. Consult a healthcare provider for
          specific health conditions.
        </p>
      </footer>
    </article>
  );
}
