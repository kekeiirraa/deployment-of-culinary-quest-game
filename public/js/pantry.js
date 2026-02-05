// ca2 frontend - chef's pantry page (ingredients)
// when backend has GET /games/user/:id/pantry we can load real data

function initPantry() {
  if (!requireAuth()) return;
  const container = document.getElementById('pantry-ingredients-container');
  if (!container) return;

  // placeholder: no pantry API yet - show message and sample ingredients
  container.innerHTML = '<p class="muted">Complete Kitchen Quests to earn ingredients. Your collected ingredients will appear here.</p>' +
    '<p class="muted">Ingredients you can earn: Fresh Berries &#128156;, Leafy Greens &#127793;, Protein Boost &#127831;, Whole Grains &#127806;, Chef\'s Spirit &#10024;</p>';
}
