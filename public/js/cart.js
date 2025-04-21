
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // Function to fetch cart items
  async function fetchCart() {
    try {
      const response = await fetch('/api/cart', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return { items: [], totalPrice: 0 };
    }
  }
  
  // Function to display cart items
  async function displayCart() {
    const cartContainer = document.getElementById('cart-container');
    const cartTotalElement = document.getElementById('cart-total');
    
    // Show loading state
    cartContainer.innerHTML = '<p>Loading cart...</p>';
    
    const cart = await fetchCart();
    
    if (cart.items.length === 0) {
      cartContainer.innerHTML = '<p>Your cart is empty.</p>';
      cartTotalElement.textContent = '$0.00';
      return;
    }
    
    // Generate HTML for cart items
    let html = '<div class="cart-items">';
    
    cart.items.forEach(item => {
      html += `
        <div class="cart-item">
          <div class="cart-item-image">
            <img src="${item.product.images?.[0] || '/img/placeholder.jpg'}" alt="${item.product.title}">
          </div>
          <div class="cart-item-details">
            <h3>${item.product.title}</h3>
            <p>Price: $${item.price.toFixed(2)}</p>
            <div class="quantity-controls">
              <button class="quantity-btn" data-action="decrease" data-product-id="${item.product._id}">-</button>
              <span class="quantity">${item.quantity}</span>
              <button class="quantity-btn" data-action="increase" data-product-id="${item.product._id}">+</button>
            </div>
          </div>
          <div class="cart-item-total">
            <p>$${(item.price * item.quantity).toFixed(2)}</p>
            <button class="remove-btn" data-product-id="${item.product._id}">Remove</button>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    cartContainer.innerHTML = html;
    cartTotalElement.textContent = `$${cart.totalPrice.toFixed(2)}`;
    
    // Add event listeners for quantity buttons
    const quantityButtons = document.querySelectorAll('.quantity-btn');
    quantityButtons.forEach(button => {
      button.addEventListener('click', async function() {
        const productId = this.getAttribute('data-product-id');
        const action = this.getAttribute('data-action');
        const quantityElement = this.parentElement.querySelector('.quantity');
        let quantity = parseInt(quantityElement.textContent);
        
        if (action === 'decrease') {
          quantity = Math.max(1, quantity - 1);
        } else if (action === 'increase') {
          quantity += 1;
        }
        
        await updateCartItem(productId, quantity);
        displayCart();
      });
    });
    
    // Add event listeners for remove buttons
    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
      button.addEventListener('click', async function() {
        const productId = this.getAttribute('data-product-id');
        await removeFromCart(productId);
        displayCart();
      });
    });
  }
  
  // Function to update cart item
  async function updateCartItem(productId, quantity) {
    try {
      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cart');
      }
      
    } catch (error) {
      console.error('Error updating cart:', error);
      alert('Failed to update cart item.');
    }
  }
  
  // Function to remove item from cart
  async function removeFromCart(productId) {
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove from cart');
      }
      
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Failed to remove item from cart.');
    }
  }
  
  // Function to clear cart
  async function clearCart() {
    try {
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
      
      displayCart();
      
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart.');
    }
  }
  
  // Display cart on page load
  displayCart();
  
  // Add event listener for clear cart button
  const clearCartBtn = document.getElementById('clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
  }
  
  // Add event listener for checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      window.location.href = '/checkout.html';
    });
  }
  
  // Add event listener for view recommendations button
  const viewRecommendationsBtn = document.getElementById('view-recommendations-btn');
  if (viewRecommendationsBtn) {
    viewRecommendationsBtn.addEventListener('click', function() {
      window.location.href = '/recommendations.html';
    });
  }
});
