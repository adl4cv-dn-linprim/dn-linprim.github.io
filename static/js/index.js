window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

})

// ============================================
// Image Data Configuration
// ============================================
// Easy to extend: Add more scenes by adding entries to the scenes object
const comparisonData = {
    scenes: {
        'DSC00767': {
            rgb: {
                ours: 'static/images/ours/ours_rgb_DSC00767.png',
                linprim: 'static/images/linprim/linprim_rgb_DSC00767.png',
                'dn-splatter': 'static/images/dn-splatter/dn_splatter_rgb_DSC00767.jpg',
                'ground-truth': 'static/images/ground-truth/gt_rgb_DSC00767.png'
            },
            depth: {
                ours: 'static/images/ours/ours_depth_DSC00767.png',
                linprim: 'static/images/linprim/linprim_depth_DSC00767.png',
                'dn-splatter': 'static/images/dn-splatter/dn_splatter_depth_DSC00767.png',
                'ground-truth': 'static/images/ground-truth/gt_depth_DSC00767.png'
            },
            normals: {
                ours: 'static/images/ours/ours_normals_DSC00767.png',
                linprim: 'static/images/linprim/linprim_normals_DSC00767.png',
                'dn-splatter': 'static/images/dn-splatter/dn_splatter_nromals_DSC00767.jpg',
                'ground-truth': 'static/images/ground-truth/gt_normals_DSC00767.png'
            }
        },
        'DSC00784': {
            rgb: {
                ours: 'static/images/ours/ours_rgb_DSC00784.png',
                linprim: 'static/images/linprim/linprim_rgb_DSC00784.png',
                'dn-splatter': 'static/images/dn-splatter/dn_splatter_rgb_DSC00784.jpg',
                'ground-truth': 'static/images/ground-truth/gt_rgb_DSC00784.png'
            },
            depth: {
                ours: 'static/images/ours/ours_depth_DSC00784.png',
                linprim: 'static/images/linprim/linprim_depth_DSC00784.png',
                'dn-splatter': 'static/images/dn-splatter/dn_splatter_depth_DSC00784.png',
                'ground-truth': 'static/images/ground-truth/gt_depth_DSC00784.png'
            },
            normals: {
                ours: 'static/images/ours/ours_normals_DSC00784.png',
                linprim: 'static/images/linprim/linprim_normals_DSC00784.png',
                'dn-splatter': 'static/images/dn-splatter/dn_splatter_normals_DSC00784.jpg',
                'ground-truth': 'static/images/ground-truth/gt_normals_DSC00784.png'
            }
        }
    }
};

// ============================================
// Comparison Slider Class
// ============================================
class ImageComparisonSlider {
    constructor() {
        this.currentScene = 'DSC00767'; // Default scene
        this.currentModality = 'rgb';
        this.leftMethod = 'ours';
        this.rightMethod = 'linprim';
        this.isDragging = false;
        this.sliderPosition = 50;
        this.imageCache = {};

        this.initElements();
        this.preloadImages();
        this.bindEvents();
        this.updateImages();
    }

    initElements() {
        this.wrapper = document.querySelector('.comparison-wrapper');
        this.overlay = document.getElementById('overlay-container');
        this.slider = document.getElementById('slider-handle');
        this.baseImage = document.getElementById('base-image');
        this.overlayImage = document.getElementById('overlay-image');
        this.labelLeft = document.getElementById('label-left');
        this.labelRight = document.getElementById('label-right');

        // Check if all elements exist
        if (!this.wrapper || !this.overlay || !this.slider || !this.baseImage || !this.overlayImage) {
            console.error('Image comparison slider elements not found');
            return;
        }
    }

    /**
     * Preload all images to ensure smooth transitions
     */
    preloadImages() {
        Object.keys(comparisonData.scenes).forEach(scene => {
            Object.keys(comparisonData.scenes[scene]).forEach(modality => {
                Object.keys(comparisonData.scenes[scene][modality]).forEach(method => {
                    const path = comparisonData.scenes[scene][modality][method];
                    if (!this.imageCache[path]) {
                        const img = new Image();
                        img.src = path;
                        this.imageCache[path] = img;
                    }
                });
            });
        });
    }

    bindEvents() {
        // Scene selector (if exists)
        const sceneSelector = document.getElementById('scene-selector');
        if (sceneSelector) {
            sceneSelector.addEventListener('change', (e) => {
                this.currentScene = e.target.value;
                this.updateImages();
            });
        }

        // Modality tabs
        document.querySelectorAll('#modality-tabs li').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('#modality-tabs li').forEach(t => t.classList.remove('is-active'));
                tab.classList.add('is-active');
                this.currentModality = tab.dataset.modality;
                this.updateImages();
            });
        });

        // Method buttons - Smart selection with "Ours" preference
        // Rules:
        // 1. Always keep 2 buttons selected
        // 2. "Ours" should stay selected unless explicitly deselected
        // 3. When selecting a non-ours button, ensure "Ours" is also selected
        // 4. Default fallback: "Ours" is the preferred method

        const DEFAULT_METHOD = 'ours'; // Easy to change default here

        document.querySelectorAll('.comparison-methods .button').forEach(button => {
            button.addEventListener('click', () => {
                const clickedMethod = button.dataset.method;
                const isSelected = button.classList.contains('is-selected');

                if (isSelected) {
                    // Deselecting a button
                    const selectedButtons = Array.from(document.querySelectorAll('.comparison-methods .button.is-selected'));

                    if (clickedMethod === DEFAULT_METHOD) {
                        // User is deselecting "Ours" - allow it
                        button.classList.remove('is-selected');

                        // If only one other button is selected, select another non-ours button
                        const remaining = Array.from(document.querySelectorAll('.comparison-methods .button.is-selected'));
                        if (remaining.length < 2) {
                            const allButtons = Array.from(document.querySelectorAll('.comparison-methods .button'));
                            const nonSelected = allButtons.find(b => !b.classList.contains('is-selected'));
                            if (nonSelected) {
                                nonSelected.classList.add('is-selected');
                            }
                        }
                    } else {
                        // Deselecting a non-ours button
                        button.classList.remove('is-selected');

                        const oursButton = document.querySelector(`.comparison-methods .button[data-method="${DEFAULT_METHOD}"]`);
                        const oursSelected = oursButton?.classList.contains('is-selected');

                        if (!oursSelected) {
                            // "Ours" is not selected, select it as default
                            oursButton?.classList.add('is-selected');
                        } else {
                            // "Ours" is already selected, need to find another button
                            const remaining = Array.from(document.querySelectorAll('.comparison-methods .button.is-selected'));
                            if (remaining.length < 2) {
                                const allButtons = Array.from(document.querySelectorAll('.comparison-methods .button'));
                                const nonSelected = allButtons.find(b =>
                                    !b.classList.contains('is-selected') &&
                                    b.dataset.method !== clickedMethod
                                );
                                if (nonSelected) {
                                    nonSelected.classList.add('is-selected');
                                }
                            }
                        }
                    }
                } else {
                    // Selecting a button
                    const selectedButtons = Array.from(document.querySelectorAll('.comparison-methods .button.is-selected'));
                    const oursButton = document.querySelector(`.comparison-methods .button[data-method="${DEFAULT_METHOD}"]`);
                    const oursSelected = oursButton?.classList.contains('is-selected');

                    if (clickedMethod === DEFAULT_METHOD) {
                        // User is selecting "Ours"
                        button.classList.add('is-selected');

                        // If we now have more than 2, remove the oldest non-ours selection
                        const newSelected = Array.from(document.querySelectorAll('.comparison-methods .button.is-selected'));
                        if (newSelected.length > 2) {
                            const toRemove = newSelected.find(b => b.dataset.method !== DEFAULT_METHOD);
                            if (toRemove) {
                                toRemove.classList.remove('is-selected');
                            }
                        }
                    } else {
                        // User is selecting a non-ours button
                        if (!oursSelected) {
                            // "Ours" is not selected, ensure it gets selected
                            oursButton?.classList.add('is-selected');
                            button.classList.add('is-selected');

                            // If we now have more than 2, remove the oldest non-ours, non-clicked selection
                            const newSelected = Array.from(document.querySelectorAll('.comparison-methods .button.is-selected'));
                            if (newSelected.length > 2) {
                                const toRemove = newSelected.find(b =>
                                    b.dataset.method !== DEFAULT_METHOD &&
                                    b.dataset.method !== clickedMethod
                                );
                                if (toRemove) {
                                    toRemove.classList.remove('is-selected');
                                }
                            }
                        } else {
                            // "Ours" is already selected
                            button.classList.add('is-selected');

                            // If we now have more than 2, remove the oldest non-ours, non-clicked selection
                            const newSelected = Array.from(document.querySelectorAll('.comparison-methods .button.is-selected'));
                            if (newSelected.length > 2) {
                                const toRemove = newSelected.find(b =>
                                    b.dataset.method !== DEFAULT_METHOD &&
                                    b.dataset.method !== clickedMethod
                                );
                                if (toRemove) {
                                    toRemove.classList.remove('is-selected');
                                }
                            }
                        }
                    }
                }

                // Update left and right methods based on selection
                // IMPORTANT: If "Ours" is selected, it should ALWAYS be on the left
                const allButtons = Array.from(document.querySelectorAll('.comparison-methods .button'));
                const selectedButtons = allButtons.filter(b => b.classList.contains('is-selected'));

                const oursButton = selectedButtons.find(b => b.dataset.method === DEFAULT_METHOD);
                const otherButton = selectedButtons.find(b => b.dataset.method !== DEFAULT_METHOD);

                if (oursButton) {
                    // "Ours" is selected - it goes on the left
                    this.leftMethod = DEFAULT_METHOD;
                    this.rightMethod = otherButton?.dataset.method || 'linprim';
                } else {
                    // "Ours" is not selected - use DOM order for the two selected buttons
                    this.leftMethod = selectedButtons[0]?.dataset.method || DEFAULT_METHOD;
                    this.rightMethod = selectedButtons[1]?.dataset.method || 'linprim';
                }

                this.updateImages();
            });
        });

        // Slider dragging - Mouse events
        this.wrapper.addEventListener('mousedown', this.startDrag.bind(this));
        document.addEventListener('mousemove', this.onDrag.bind(this));
        document.addEventListener('mouseup', this.stopDrag.bind(this));

        // Slider dragging - Touch events
        this.wrapper.addEventListener('touchstart', this.startDrag.bind(this), { passive: false });
        document.addEventListener('touchmove', this.onDrag.bind(this), { passive: false });
        document.addEventListener('touchend', this.stopDrag.bind(this));

        // Prevent default drag behavior on images
        this.baseImage.addEventListener('dragstart', (e) => e.preventDefault());
        this.overlayImage.addEventListener('dragstart', (e) => e.preventDefault());
    }


    startDrag(e) {
        this.isDragging = true;
        this.updateSliderPosition(e);
        e.preventDefault();
    }

    stopDrag() {
        this.isDragging = false;
    }

    onDrag(e) {
        if (!this.isDragging) return;
        this.updateSliderPosition(e);
        e.preventDefault();
    }

    updateSliderPosition(e) {
        const rect = this.wrapper.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

        this.sliderPosition = percentage;
        this.slider.style.left = `${percentage}%`;
        this.overlay.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    }

    /**
     * Update images with smooth transitions and no flicker
     */
    updateImages() {
        const sceneData = comparisonData.scenes[this.currentScene];
        if (!sceneData) {
            console.error(`Scene ${this.currentScene} not found`);
            return;
        }

        const leftSrc = sceneData[this.currentModality][this.leftMethod];
        const rightSrc = sceneData[this.currentModality][this.rightMethod];

        // HTML structure explanation:
        // - base-image is always visible underneath
        // - overlay-image is clipped and sits on top
        // - When slider is at 0% (left): overlay is clipped completely (base visible = RIGHT side)
        // - When slider is at 100% (right): overlay is fully visible (covers base = LEFT side)
        // Therefore:
        // - base-image should show RIGHT method (visible when slider at 0%)
        // - overlay-image should show LEFT method (visible when slider at 100%)

        // Use cached images if available
        if (this.imageCache[leftSrc] && this.imageCache[rightSrc]) {
            // Images are already loaded, update immediately
            this.baseImage.src = rightSrc;      // Right method goes to base (visible on right)
            this.overlayImage.src = leftSrc;    // Left method goes to overlay (visible on left)
            this.updateLabels();
        } else {
            // Load images with flicker prevention
            const img1 = new Image();
            const img2 = new Image();
            let loaded = 0;

            const checkComplete = () => {
                loaded++;
                if (loaded === 2) {
                    this.baseImage.src = rightSrc;      // Right method goes to base
                    this.overlayImage.src = leftSrc;    // Left method goes to overlay
                    this.updateLabels();
                }
            };

            img1.onload = checkComplete;
            img2.onload = checkComplete;

            img1.src = leftSrc;
            img2.src = rightSrc;

            // Cache the images
            this.imageCache[leftSrc] = img1;
            this.imageCache[rightSrc] = img2;
        }
    }

    /**
     * Update method labels with proper formatting
     */
    updateLabels() {
        const formatMethodName = (method) => {
            if (method === 'dn-splatter') return 'DN-Splatter';
            if (method === 'ground-truth') return 'Ground Truth';
            if (method === 'linprim') return 'LinPrim';
            return method.charAt(0).toUpperCase() + method.slice(1);
        };

        this.labelLeft.textContent = formatMethodName(this.leftMethod);
        this.labelRight.textContent = formatMethodName(this.rightMethod);
    }
}

// ============================================
// Initialize on DOM Ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    new ImageComparisonSlider();
});