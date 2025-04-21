
// Recommendations functionality
document.addEventListener('DOMContentLoaded', function() {
  // Function to fetch recommendations
  async function fetchRecommendations() {
    try {
      const response = await fetch('/api/recommendations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return { recommendations: [] };
    }
  }
  
  // Function to display recommendations
  async function displayRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations-container');
    if (!recommendationsContainer) return;
    
    // Show loading state
    recommendationsContainer.innerHTML = '<p>Loading recommendations...</p>';
    
    const data = await fetchRecommendations();
    
    if (data.recommendations.length === 0) {
      recommendationsContainer.innerHTML = '<p>Add products to your cart to see personalized recommendations!</p>';
      return;
    }
    
    // Generate HTML for recommendations
    let html = '<h2>Recommended for You</h2><div class="recommendations-grid">';
    
    data.recommendations.forEach(product => {
      html += `
        <div class="product-card">
          <img src="${product.images?.[0] || '/img/placeholder.jpg'}" alt="${product.title}">
          <h3>${product.title}</h3>
          <p class="price">$${product.price.toFixed(2)}</p>
          <button class="add-to-cart-btn" data-product-id="${product._id}">Add to Cart</button>
        </div>
      `;
    });
    
    html += '</div>';
    
    if (data.recommendationIds && data.recommendationIds.length > 0) {
      html += '<div class="recommendation-info hidden">';
      data.recommendationIds.forEach(rec => {
        html += `<div data-recommendation-id="${rec.recommendationId}" data-product-id="${rec.productId}"></div>`;
      });
      html += '</div>';
    }
    
    recommendationsContainer.innerHTML = html;
    
    // Add event listeners to the "Add to Cart" buttons
    const addToCartButtons = recommendationsContainer.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', async function() {
        const productId = this.getAttribute('data-product-id');
        await addToCart(productId, 1);
      });
    });
  }
  
  // Function to add product to cart
  async function addToCart(productId, quantity) {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }
      
      alert('Product added to cart successfully!');
      // Refresh recommendations after adding to cart
      displayRecommendations();
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart.');
    }
  }
  
  // Call displayRecommendations when the page loads
  if (localStorage.getItem('token')) {
    displayRecommendations();
  }
  
  // Add event listener for page navigation
  const viewRecommendationsBtn = document.getElementById('view-recommendations-btn');
  if (viewRecommendationsBtn) {
    viewRecommendationsBtn.addEventListener('click', function() {
      displayRecommendations();
    });
  }
});
