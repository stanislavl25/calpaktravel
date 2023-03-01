window.okeReviewsWidgetOnInit = function() {
    const writeReview = document.querySelector(".okeReviews .okeReviews-reviewsWidget-header-controls-writeReview");
    const filterToggle = document.querySelector(".okeReviews-reviews-controls-filterToggle");
    if (filterToggle && writeReview) {
        filterToggle.insertAdjacentElement("afterend", writeReview);
    }
};