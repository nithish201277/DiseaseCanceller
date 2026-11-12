import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { RecipeItem, LoggedMeal } from '../../types';
import {
  Apple,
  Search,
  Filter,
  Plus,
  Flame,
  Clock,
  ChevronRight,
  X,
  Check,
  Sparkles,
  BookOpen,
  Info,
} from 'lucide-react';
import { fetchNutritionAdvice } from '../../services/api';

export const NutritionView: React.FC = () => {
  const {
    recipes,
    loggedMeals,
    addLoggedMeal,
    removeLoggedMeal,
    dailyNutritionSummary,
    activeProfile,
  } = useHealth();

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterCuisine, setFilterCuisine] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>(null);
  const [customFoodName, setCustomFoodName] = useState('');
  const [customCalories, setCustomCalories] = useState('250');
  const [customProtein, setCustomProtein] = useState('10');
  const [customCarbs, setCustomCarbs] = useState('35');
  const [customFat, setCustomFat] = useState('6');
  const [customFiber, setCustomFiber] = useState('4');
  const [customMealType, setCustomMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGeneratedRecipes, setAiGeneratedRecipes] = useState<RecipeItem[]>([]);

  // Filter recipes
  const allRecipes = [...aiGeneratedRecipes, ...recipes];
  const filteredRecipes = allRecipes.filter((r) => {
    const matchesCategory = filterCategory === 'All' || r.category === filterCategory;
    const matchesCuisine =
      filterCuisine === 'All' ||
      (filterCuisine === 'Indian' && (r.cuisine === 'Indian' || r.cuisine === 'South Indian')) ||
      (filterCuisine === 'South Indian' && r.cuisine === 'South Indian') ||
      (filterCuisine === 'Vegetarian' && r.dietType === 'Vegetarian') ||
      (filterCuisine === 'Budget-Friendly' && r.isBudgetFriendly);
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ingredients.some((ing) => ing.item.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesCuisine && matchesSearch;
  });

  const handleLogRecipe = (recipe: RecipeItem) => {
    const mealCategory =
      recipe.category === 'Healthy Snack' ? 'Snack' : (recipe.category as any);

    addLoggedMeal({
      mealType: mealCategory,
      foodName: recipe.name,
      calories: recipe.calories,
      proteinG: recipe.proteinG,
      carbsG: recipe.carbsG,
      fatG: recipe.fatG,
      fiberG: recipe.fiberG,
    });
  };

  const handleAddCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodName.trim()) return;

    addLoggedMeal({
      mealType: customMealType,
      foodName: customFoodName.trim(),
      calories: parseInt(customCalories, 10) || 0,
      proteinG: parseInt(customProtein, 10) || 0,
      carbsG: parseInt(customCarbs, 10) || 0,
      fatG: parseInt(customFat, 10) || 0,
      fiberG: parseInt(customFiber, 10) || 0,
    });

    setCustomFoodName('');
    setShowCustomModal(false);
  };

  const handleGenerateAiMeals = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetchNutritionAdvice({
        age: activeProfile.age,
        dietPreference: activeProfile.dietaryPreference,
        allergies: activeProfile.allergies,
        healthConditions: activeProfile.existingConditions,
      });

      if (res.recommendations && Array.isArray(res.recommendations)) {
        const formatted: RecipeItem[] = res.recommendations.map((rec: any, i: number) => ({
          id: `ai-rec-${Date.now()}-${i}`,
          name: rec.name || rec.recipeName,
          category: (rec.mealType as any) || 'Lunch',
          cuisine: rec.cuisine || 'Indian',
          dietType: activeProfile.dietaryPreference === 'vegan' ? 'Vegan' : 'Vegetarian',
          isBudgetFriendly: true,
          calories: rec.calories || 380,
          proteinG: rec.protein || 14,
          carbsG: rec.carbs || 50,
          fatG: rec.fat || 10,
          fiberG: rec.fiber || 8,
          servingSize: rec.servingSize || '1 portion',
          prepTimeMinutes: parseInt(rec.prepTime, 10) || 10,
          cookTimeMinutes: parseInt(rec.cookTime, 10) || 15,
          imageUrl: '/src/assets/images/nutrition_healthy_bowl_1794477238884.jpg',
          ingredients: Array.isArray(rec.ingredients)
            ? rec.ingredients.map((ing: string) => ({ item: ing, amount: '' }))
            : [],
          instructions: rec.instructions || ['Cook ingredients with low sodium tempering until done.'],
          healthyAlternatives: rec.healthyAlternatives || 'Pair with steamed greens or sprouted dal.',
          suitableForConditions: activeProfile.existingConditions,
        }));
        setAiGeneratedRecipes((prev) => [...formatted, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <Apple className="w-4 h-4" />
            <span>Personalized Nutrition & Dietary Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Smart Food & Nutrition
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Wholesome meal recommendations tailored to {activeProfile.fullName} ({activeProfile.dietaryPreference}, {activeProfile.age} yrs)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAiMeals}
            disabled={isAiGenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:opacity-90 text-slate-950 font-bold text-xs transition-opacity shadow-md shadow-teal-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAiGenerating ? 'Generating Recipes...' : 'AI Custom Meal Plan'}</span>
          </button>
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Custom Food</span>
          </button>
        </div>
      </div>

      {/* Daily Nutrition Tracker Bar */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Today's Caloric & Macronutrient Intake</h3>
            <p className="text-xs text-slate-400">
              Target calculated using Mifflin-St Jeor equation: {dailyNutritionSummary.targetCalories} kcal
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-300">
              Consumed: <strong className="text-teal-400 tabular-nums">{dailyNutritionSummary.calories}</strong> / {dailyNutritionSummary.targetCalories} kcal
            </span>
          </div>
        </div>

        {/* 4 Macros Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[11px] text-slate-400">Protein</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-white tabular-nums">{dailyNutritionSummary.proteinG}</span>
              <span className="text-xs text-teal-400 font-mono">g</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (dailyNutritionSummary.proteinG / 70) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[11px] text-slate-400">Carbohydrates</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-white tabular-nums">{dailyNutritionSummary.carbsG}</span>
              <span className="text-xs text-sky-400 font-mono">g</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (dailyNutritionSummary.carbsG / 220) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[11px] text-slate-400">Healthy Fats</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-white tabular-nums">{dailyNutritionSummary.fatG}</span>
              <span className="text-xs text-amber-400 font-mono">g</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (dailyNutritionSummary.fatG / 55) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[11px] text-slate-400">Dietary Fiber</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-white tabular-nums">{dailyNutritionSummary.fiberG}</span>
              <span className="text-xs text-emerald-400 font-mono">g</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (dailyNutritionSummary.fiberG / 30) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Logged meals strip */}
        {loggedMeals.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Logged in Today's Food Diary:
            </span>
            <div className="flex flex-wrap gap-2">
              {loggedMeals.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300"
                >
                  <span className="font-medium text-white">{m.foodName}</span>
                  <span className="text-[11px] text-slate-400 tabular-nums font-mono">
                    ({m.calories} kcal · {m.proteinG}g P)
                  </span>
                  <button
                    onClick={() => removeLoggedMeal(m.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors ml-1"
                    title="Remove item"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Meal Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {['All', 'Breakfast', 'Lunch', 'Dinner', 'Healthy Snack'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterCategory === cat
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or ingredients..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg glass-input text-xs"
            />
          </div>
        </div>

        {/* Cuisine & Diet Tag Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] text-slate-500 font-medium shrink-0">Specialty:</span>
          {['All', 'Indian', 'South Indian', 'Vegetarian', 'Budget-Friendly'].map((cui) => (
            <button
              key={cui}
              onClick={() => setFilterCuisine(cui)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap font-medium transition-colors ${
                filterCuisine === cui
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cui}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="rounded-2xl glass-panel border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-teal-500/40 transition-all duration-300"
          >
            <div>
              {/* Card Image */}
              <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                <img
                  src={recipe.imageUrl || '/src/assets/images/nutrition_healthy_bowl_1794477238884.jpg'}
                  alt={recipe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-teal-300 border border-teal-500/30">
                    {recipe.category}
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-sky-300 border border-sky-500/30">
                    {recipe.cuisine}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-2.5">
                <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                  {recipe.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {recipe.servingSize} · Prep: {recipe.prepTimeMinutes}m · Cook: {recipe.cookTimeMinutes}m
                </p>

                {/* Macronutrient Grid */}
                <div className="grid grid-cols-4 gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Calories</span>
                    <span className="font-bold text-white tabular-nums">{recipe.calories}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Protein</span>
                    <span className="font-bold text-teal-300 tabular-nums">{recipe.proteinG}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Carbs</span>
                    <span className="font-bold text-sky-300 tabular-nums">{recipe.carbsG}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Fiber</span>
                    <span className="font-bold text-emerald-300 tabular-nums">{recipe.fiberG}g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-4 pt-0 flex items-center gap-2">
              <button
                onClick={() => setSelectedRecipe(recipe)}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/80 transition-colors flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                <span>View Recipe</span>
              </button>
              <button
                onClick={() => handleLogRecipe(recipe)}
                className="px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-semibold border border-teal-500/40 transition-colors flex items-center gap-1"
                title="Add to daily food diary"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel border border-slate-700 p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold">
                  <span>{selectedRecipe.cuisine}</span>
                  <span>·</span>
                  <span>{selectedRecipe.category}</span>
                  <span>·</span>
                  <span>{selectedRecipe.dietType}</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{selectedRecipe.name}</h2>
              </div>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nutrients Box */}
            <div className="grid grid-cols-5 gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Calories</span>
                <span className="font-bold text-white text-sm tabular-nums">{selectedRecipe.calories} kcal</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Protein</span>
                <span className="font-bold text-teal-300 text-sm tabular-nums">{selectedRecipe.proteinG}g</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Carbs</span>
                <span className="font-bold text-sky-300 text-sm tabular-nums">{selectedRecipe.carbsG}g</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Fat</span>
                <span className="font-bold text-amber-300 text-sm tabular-nums">{selectedRecipe.fatG}g</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Fiber</span>
                <span className="font-bold text-emerald-300 text-sm tabular-nums">{selectedRecipe.fiberG}g</span>
              </div>
            </div>

            {/* Ingredients & Prep */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Ingredients Required ({selectedRecipe.ingredients.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="text-slate-200">{ing.item}</span>
                    <span className="text-teal-400 font-mono tabular-nums">{ing.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Cooking Instructions
              </h4>
              <ol className="space-y-2 text-xs text-slate-300">
                {selectedRecipe.instructions.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/40">
                    <span className="font-mono text-teal-400 font-bold">{i + 1}.</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Healthy Alternatives */}
            <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 text-xs text-teal-200 space-y-1">
              <span className="font-bold text-teal-300">Healthy Swaps & Clinical Alternatives:</span>
              <p className="leading-relaxed text-slate-300">{selectedRecipe.healthyAlternatives}</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Nutritional values derived from clinical nutrition databases.
              </span>
              <button
                onClick={() => {
                  handleLogRecipe(selectedRecipe);
                  setSelectedRecipe(null);
                }}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20"
              >
                Log This Meal to Daily Diary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Food Logging Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Log Custom Food to Diary</h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomMeal} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Food Item Name</label>
                <input
                  type="text"
                  required
                  value={customFoodName}
                  onChange={(e) => setCustomFoodName(e.target.value)}
                  placeholder="e.g. Steamed Dhokla (2 pcs), Boiled Eggs, Curd Rice..."
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Meal Time</label>
                  <select
                    value={customMealType}
                    onChange={(e) => setCustomMealType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Healthy Snack</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Calories (kcal)</label>
                  <input
                    type="number"
                    min={0}
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Protein (g)</label>
                  <input
                    type="number"
                    min={0}
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg glass-input text-xs tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Carbs (g)</label>
                  <input
                    type="number"
                    min={0}
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg glass-input text-xs tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Fat (g)</label>
                  <input
                    type="number"
                    min={0}
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg glass-input text-xs tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Fiber (g)</label>
                  <input
                    type="number"
                    min={0}
                    value={customFiber}
                    onChange={(e) => setCustomFiber(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg glass-input text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
