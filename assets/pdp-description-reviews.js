document.addEventListener("DOMContentLoaded", function() {
    let reviews = Array.from(document.querySelectorAll(".pdp__description-review"));
    let currentReview = 0;
  
    // A function to hide all reviews
    function hideAllReviews() {
      reviews.forEach(review => {
        review.style.display = 'none';
        review.style.opacity = '0';
      });
    }
  
    // A function to show a particular review
    function showReview(index) {
      hideAllReviews();
      reviews[index].style.display = 'block';
      reviews[index].style.opacity = '1';
    }
  
    // Initially, we want to show the first review
    showReview(currentReview);
  
    // Set an interval to cycle through the reviews
    setInterval(function() {
      currentReview = (currentReview + 1) % reviews.length;
      showReview(currentReview);
    }, 5000); // Change every 5 seconds
});