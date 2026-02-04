// ============================================
// Results Section Dropdown Toggle
// ============================================
function toggleResultsSection(button) {
    const dropdown = button.closest('.results-section-dropdown');
    const content = dropdown.querySelector('.results-section-content');

    button.classList.toggle('collapsed');
    content.classList.toggle('collapsed');
}

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
// 4-Way Quad Image Comparison Slider
// ============================================
class QuadImageComparison {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.wrapper = this.container.querySelector('.quad-image-wrapper');
        this.handle = document.getElementById('quad-slider-handle');
        this.lineH = document.getElementById('quad-line-h');
        this.lineV = document.getElementById('quad-line-v');

        this.quadrants = {
            topLeft: this.container.querySelector('.quad-top-left'),
            topRight: this.container.querySelector('.quad-top-right'),
            bottomLeft: this.container.querySelector('.quad-bottom-left'),
            bottomRight: this.container.querySelector('.quad-bottom-right')
        };

        // Position as percentage (0-100)
        this.posX = 50;
        this.posY = 50;

        this.isDragging = false;
        this.bounds = null;

        this.init();
    }

    init() {
        this.updateClipping();
        this.bindEvents();

        // Update bounds on resize
        window.addEventListener('resize', () => {
            this.bounds = null;
        });
    }

    getBounds() {
        if (!this.bounds) {
            this.bounds = this.wrapper.getBoundingClientRect();
        }
        return this.bounds;
    }

    bindEvents() {
        // Mouse events
        this.handle.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());

        // Touch events
        this.handle.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        document.addEventListener('touchend', () => this.endDrag());

        // Click anywhere in wrapper to move slider
        this.wrapper.addEventListener('click', (e) => {
            if (e.target === this.handle || this.handle.contains(e.target)) return;
            this.moveToPosition(e);
        });

        // Prevent image dragging
        this.wrapper.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', (e) => e.preventDefault());
        });
    }

    startDrag(e) {
        e.preventDefault();
        this.isDragging = true;
        this.bounds = null; // Reset bounds
        this.handle.style.transition = 'none';
        this.lineH.style.transition = 'none';
        this.lineV.style.transition = 'none';
        document.body.style.cursor = 'grabbing';
    }

    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        const bounds = this.getBounds();
        let clientX, clientY;

        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // Calculate position as percentage
        let x = ((clientX - bounds.left) / bounds.width) * 100;
        let y = ((clientY - bounds.top) / bounds.height) * 100;

        // Clamp values between 2% and 98% for better UX
        this.posX = Math.max(2, Math.min(98, x));
        this.posY = Math.max(2, Math.min(98, y));

        this.updateClipping();
    }

    endDrag() {
        if (!this.isDragging) return;
        this.isDragging = false;
        document.body.style.cursor = '';

        // Re-enable transitions
        this.handle.style.transition = '';
        this.lineH.style.transition = '';
        this.lineV.style.transition = '';
    }

    moveToPosition(e) {
        const bounds = this.getBounds();
        let x = ((e.clientX - bounds.left) / bounds.width) * 100;
        let y = ((e.clientY - bounds.top) / bounds.height) * 100;

        this.posX = Math.max(2, Math.min(98, x));
        this.posY = Math.max(2, Math.min(98, y));

        // Add smooth transition for click
        this.handle.style.transition = 'left 0.3s ease, top 0.3s ease';
        this.lineH.style.transition = 'top 0.3s ease';
        this.lineV.style.transition = 'left 0.3s ease';

        this.updateClipping();

        // Remove transition after animation
        setTimeout(() => {
            this.handle.style.transition = '';
            this.lineH.style.transition = '';
            this.lineV.style.transition = '';
        }, 300);
    }

    updateClipping() {
        const x = this.posX;
        const y = this.posY;

        // Update handle position
        this.handle.style.left = `${x}%`;
        this.handle.style.top = `${y}%`;

        // Update slider lines
        this.lineH.style.top = `${y}%`;
        this.lineV.style.left = `${x}%`;

        // Apply clip-path to each quadrant
        // Top-Left: visible from (0,0) to (x,y)
        this.quadrants.topLeft.style.clipPath = `polygon(0 0, ${x}% 0, ${x}% ${y}%, 0 ${y}%)`;

        // Top-Right: visible from (x,0) to (100,y)
        this.quadrants.topRight.style.clipPath = `polygon(${x}% 0, 100% 0, 100% ${y}%, ${x}% ${y}%)`;

        // Bottom-Left: visible from (0,y) to (x,100)
        this.quadrants.bottomLeft.style.clipPath = `polygon(0 ${y}%, ${x}% ${y}%, ${x}% 100%, 0 100%)`;

        // Bottom-Right: visible from (x,y) to (100,100)
        this.quadrants.bottomRight.style.clipPath = `polygon(${x}% ${y}%, 100% ${y}%, 100% 100%, ${x}% 100%)`;

        // Update label visibility based on quadrant size
        this.updateLabelVisibility(x, y);
    }

    updateLabelVisibility(x, y) {
        const threshold = 10; // Minimum percentage for label visibility

        const labels = {
            topLeft: this.quadrants.topLeft.querySelector('.quad-label'),
            topRight: this.quadrants.topRight.querySelector('.quad-label'),
            bottomLeft: this.quadrants.bottomLeft.querySelector('.quad-label'),
            bottomRight: this.quadrants.bottomRight.querySelector('.quad-label')
        };

        // Show/hide labels based on quadrant size
        labels.topLeft.style.opacity = (x > threshold && y > threshold) ? '1' : '0';
        labels.topRight.style.opacity = ((100 - x) > threshold && y > threshold) ? '1' : '0';
        labels.bottomLeft.style.opacity = (x > threshold && (100 - y) > threshold) ? '1' : '0';
        labels.bottomRight.style.opacity = ((100 - x) > threshold && (100 - y) > threshold) ? '1' : '0';
    }

    // Public method to update images
    setImages(images) {
        if (images.topLeft) {
            this.quadrants.topLeft.querySelector('img').src = images.topLeft;
        }
        if (images.topRight) {
            this.quadrants.topRight.querySelector('img').src = images.topRight;
        }
        if (images.bottomLeft) {
            this.quadrants.bottomLeft.querySelector('img').src = images.bottomLeft;
        }
        if (images.bottomRight) {
            this.quadrants.bottomRight.querySelector('img').src = images.bottomRight;
        }
    }

    // Reset to center position
    reset() {
        this.posX = 50;
        this.posY = 50;

        this.handle.style.transition = 'left 0.3s ease, top 0.3s ease';
        this.lineH.style.transition = 'top 0.3s ease';
        this.lineV.style.transition = 'left 0.3s ease';

        this.updateClipping();

        setTimeout(() => {
            this.handle.style.transition = '';
            this.lineH.style.transition = '';
            this.lineV.style.transition = '';
        }, 300);
    }
}

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
        },
        'DSC00862': {
            rgb: {
                ours: 'static/images/ours/ours_rgb_DSC00862.png',
                linprim: 'static/images/linprim/linprim_rgb_DSC00862.png',
                'dn-splatter': 'static/images/dn-splatter/dn_splatter_rgb_DSC00862.jpg',
                'ground-truth': 'static/images/ground-truth/gt_rgb_DSC00862.png'
            },
            depth: {
                ours: 'static/images/ours/ours_depth_DSC00862.png',
                linprim: 'static/images/linprim/linprim_depth_DSC00862.png',
                'dn-splatter': 'static/images/dn-splatter/dn_splatter_depth_DSC00862.png',
                'ground-truth': 'static/images/ground-truth/gt_depth_DSC00862.png'
            },
            normals: {
                ours: 'static/images/ours/ours_normals_DSC00862.png',
                linprim: 'static/images/linprim/linprim_normals_DSC00862.png',
                'dn-splatter': 'static/images/dn-splatter/dn_splatter_normals_DSC00862.jpg',
                'ground-truth': 'static/images/ground-truth/gt_normals_DSC00862.png'
            },
            primitive: {
                ours: 'static/images/ours_vis_dc263dfbf0.png',
                linprim: 'static/images/linprim_vis_dc263dfbf0.png',
                'ground-truth': 'static/images/gt_vis_dc263dfbf0.png'
            }
        },
        'DSC00865': {
            rgb: {
                ours: 'static/images/ours/ours_rgb_DSC00865.png',
                linprim: 'static/images/linprim/linprim_rgb_DSC00865.png',
                'dn-splatter': 'static/images/dn-splatter/dn_splatter_rgb_DSC00865.jpg',
                'ground-truth': 'static/images/ground-truth/gt_rgb_DSC00865.png'
            },
            depth: {
                ours: 'static/images/ours/ours_depth_DSC00865.png',
                linprim: 'static/images/linprim/linprim_depth_DSC00865.png',
                'dn-splatter': 'static/images/dn-splatter/dn_splatter_depth_DSC00865.png',
                'ground-truth': 'static/images/ground-truth/gt_depth_DSC00865.png'
            },
            normals: {
                ours: 'static/images/ours/ours_normals_DSC00865.png',
                linprim: 'static/images/linprim/linprim_normals_DSC00865.png',
                'dn-splatter': 'static/images/dn-splatter/dn_splatter_normals_DSC00865.jpg',
                'ground-truth': 'static/images/ground-truth/gt_normals_DSC00865.png'
            },
            primitive: {
                ours: 'static/images/ours_vis_dc263dfbf0.png',
                linprim: 'static/images/linprim_vis_dc263dfbf0.png',
                'ground-truth': 'static/images/gt_vis_dc263dfbf0.png'
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
        this.rightMethod = null; // Default: only "Ours" selected
        this.isDragging = false;
        this.sliderPosition = 50;
        this.imageCache = {};

        this.initElements();
        this.preloadImages();
        this.bindEvents();
        this.initializeView(); // Initialize based on default selection
    }

    /**
     * Initialize the view based on current button selection state
     */
    initializeView() {
        const selectedButtons = document.querySelectorAll('.comparison-methods .button.is-selected');
        const placeholder = document.getElementById('comparison-placeholder');
        const helpText = document.getElementById('comparison-help-text');

        // Initialize primitive tab visibility
        this.updatePrimitiveTabVisibility();

        if (selectedButtons.length === 1) {
            // Only one method selected - show placeholder
            if (placeholder) placeholder.style.display = 'flex';
            if (helpText) helpText.style.display = 'block';
            if (this.slider) this.slider.style.display = 'none';
            if (this.overlay) this.overlay.style.display = 'none';
            this.updateLabels();
            this.updateSingleImage();
        } else {
            // Two methods selected - show comparison
            if (placeholder) placeholder.style.display = 'none';
            if (helpText) helpText.style.display = 'none';
            this.updateImages();
        }
    }

    /**
     * Update primitive tab visibility based on current scene and selected methods
     */
    updatePrimitiveTabVisibility() {
        const PRIMITIVE_SCENES = ['DSC00862', 'DSC00865'];
        const PRIMITIVE_METHODS = ['ours', 'linprim', 'ground-truth'];

        const primitiveTab = document.getElementById('primitive-tab');
        if (!primitiveTab) return;

        const isPrimitiveScene = PRIMITIVE_SCENES.includes(this.currentScene);

        // Get currently selected methods
        const selectedButtons = Array.from(document.querySelectorAll('.comparison-methods .button.is-selected'));
        const selectedMethods = selectedButtons.map(b => b.dataset.method);

        // Check if all selected methods support primitive visualization
        const allMethodsSupportPrimitive = selectedMethods.every(m => PRIMITIVE_METHODS.includes(m));

        // Show primitive tab only if:
        // 1. Current scene has primitive data
        // 2. All selected methods support primitive visualization (i.e., NOT dn-splatter)
        const showPrimitiveTab = isPrimitiveScene && allMethodsSupportPrimitive && selectedMethods.length > 0;

        primitiveTab.style.display = showPrimitiveTab ? '' : 'none';

        // If primitive tab was active but is now hidden, switch to RGB
        if (!showPrimitiveTab && this.currentModality === 'primitive') {
            this.currentModality = 'rgb';
            document.querySelectorAll('#modality-tabs li').forEach(t => t.classList.remove('is-active'));
            const rgbTab = document.querySelector('#modality-tabs li[data-modality="rgb"]');
            if (rgbTab) rgbTab.classList.add('is-active');
            this.updateImages();
        }
    }

    initElements() {
        this.wrapper = document.querySelector('.comparison-wrapper');
        this.overlay = document.getElementById('overlay-container');
        this.slider = document.getElementById('slider-handle');
        this.baseImage = document.getElementById('base-image');
        this.overlayImage = document.getElementById('overlay-image');
        this.labelLeft = document.getElementById('label-left');
        this.labelRight = document.getElementById('label-right');
        this.placeholder = document.getElementById('comparison-placeholder');

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
                this.updatePrimitiveTabVisibility();
                this.updateImages();
            });
        }

        // Modality tabs
        document.querySelectorAll('#modality-tabs li').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                // Don't allow clicking hidden tabs
                if (tab.style.display === 'none') return;

                document.querySelectorAll('#modality-tabs li').forEach(t => t.classList.remove('is-active'));
                tab.classList.add('is-active');
                this.currentModality = tab.dataset.modality;
                this.updateImages();
            });
        });

        // Method buttons - Smart selection with good UX
        // Rules:
        // 1. Minimum 1, maximum 2 buttons selected at a time
        // 2. When only 1 selected: show placeholder text instead of comparison
        // 3. When selecting a 3rd button: deselect the one furthest from the newly clicked
        // 4. Images displayed in button order (left button = left image)
        // 5. Button order (left to right): ours, linprim, dn-splatter, ground-truth

        const METHOD_ORDER = ['ours', 'linprim', 'dn-splatter', 'ground-truth'];

        // Get placeholder and help text elements
        const placeholder = document.getElementById('comparison-placeholder');
        const helpText = document.getElementById('comparison-help-text');
        const clickWarning = document.getElementById('comparison-click-warning');

        // Track blocked click attempts to detect confused users
        let blockedClickCount = 0;
        let blockedClickTimer = null;
        let warningOnCooldown = false;
        const BLOCKED_CLICK_THRESHOLD = 3; // Show warning after 3 blocked attempts
        const BLOCKED_CLICK_RESET_TIME = 4000; // Reset counter after 4 seconds of no blocked clicks
        const WARNING_COOLDOWN_TIME = 30000; // 30 seconds before warning can appear again

        const showSelectionWarning = () => {
            if (clickWarning && !warningOnCooldown) {
                clickWarning.style.display = 'block';
                warningOnCooldown = true;

                // Auto-hide after 6 seconds
                setTimeout(() => {
                    clickWarning.style.display = 'none';
                }, 6000);

                // Cooldown period before warning can show again
                setTimeout(() => {
                    warningOnCooldown = false;
                }, WARNING_COOLDOWN_TIME);
            }
        };

        const trackBlockedClick = () => {
            blockedClickCount++;

            // Reset timer
            if (blockedClickTimer) clearTimeout(blockedClickTimer);
            blockedClickTimer = setTimeout(() => {
                blockedClickCount = 0;
            }, BLOCKED_CLICK_RESET_TIME);

            // Show warning if threshold reached
            if (blockedClickCount >= BLOCKED_CLICK_THRESHOLD) {
                showSelectionWarning();
                blockedClickCount = 0;
            }
        };

        const updateComparisonView = () => {
            const allButtons = Array.from(document.querySelectorAll('.comparison-methods .button'));
            const selectedMethods = allButtons
                .filter(b => b.classList.contains('is-selected'))
                .map(b => b.dataset.method);

            // Sort by METHOD_ORDER index (left to right)
            selectedMethods.sort((a, b) => METHOD_ORDER.indexOf(a) - METHOD_ORDER.indexOf(b));

            // Update primitive tab visibility when methods change
            updatePrimitiveTabVisibility();

            if (selectedMethods.length === 1) {
                // Only one method selected - show placeholder and help text
                this.leftMethod = selectedMethods[0];
                this.rightMethod = null;

                // Show placeholder and help text, hide slider
                if (placeholder) placeholder.style.display = 'flex';
                if (helpText) helpText.style.display = 'block';
                if (this.slider) this.slider.style.display = 'none';
                if (this.overlay) this.overlay.style.display = 'none';

                // Update labels
                this.updateLabels();

                // Still show the single selected image as base
                this.updateSingleImage();
            } else if (selectedMethods.length === 2) {
                // Two methods selected - show comparison, hide help text
                this.leftMethod = selectedMethods[0];
                this.rightMethod = selectedMethods[1];

                // Hide placeholder and help text, show slider
                if (placeholder) placeholder.style.display = 'none';
                if (helpText) helpText.style.display = 'none';
                if (this.slider) this.slider.style.display = 'block';
                if (this.overlay) this.overlay.style.display = 'block';

                this.updateImages();
            }
        };

        document.querySelectorAll('.comparison-methods .button:not(:disabled)').forEach(button => {
            button.addEventListener('click', () => {
                const clickedMethod = button.dataset.method;
                const isSelected = button.classList.contains('is-selected');
                const selectedButtons = Array.from(document.querySelectorAll('.comparison-methods .button.is-selected'));

                if (isSelected) {
                    // DESELECTING a button
                    // Only allow if more than 1 button is selected (minimum 1 must stay)
                    if (selectedButtons.length > 1) {
                        button.classList.remove('is-selected');
                        updateComparisonView();
                    }
                    // If only 1 selected, do nothing (can't deselect the last one)
                } else {
                    // SELECTING a button
                    if (selectedButtons.length < 2) {
                        // Less than 2 selected - just add this one
                        button.classList.add('is-selected');
                        updateComparisonView();
                    } else {
                        // Already 2 selected - BLOCK selection and track attempt
                        trackBlockedClick();
                        // Don't change anything - user needs to deselect first
                    }
                }
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

        // Check if the current modality exists for this scene
        const modalityData = sceneData[this.currentModality];
        if (!modalityData) {
            console.error(`Modality ${this.currentModality} not found for scene ${this.currentScene}`);
            return;
        }

        const leftSrc = modalityData[this.leftMethod];
        const rightSrc = modalityData[this.rightMethod];

        // Check if methods have images for this modality (e.g., primitive doesn't exist for dn-splatter)
        if (!leftSrc || !rightSrc) {
            console.warn(`Method does not have images for ${this.currentModality} modality`);
            return;
        }

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
            if (!method) return '—';
            if (method === 'dn-splatter') return 'DN-Splatter';
            if (method === 'ground-truth') return 'Ground Truth';
            if (method === 'linprim') return 'LinPrim';
            return method.charAt(0).toUpperCase() + method.slice(1);
        };

        this.labelLeft.textContent = formatMethodName(this.leftMethod);
        this.labelRight.textContent = this.rightMethod ? formatMethodName(this.rightMethod) : 'Select a method';
    }

    /**
     * Update display when only one method is selected
     */
    updateSingleImage() {
        const sceneData = comparisonData.scenes[this.currentScene];
        if (!sceneData || !this.leftMethod) return;

        const modalityData = sceneData[this.currentModality];
        if (!modalityData) return;

        const leftSrc = modalityData[this.leftMethod];

        if (leftSrc) {
            this.baseImage.src = leftSrc;
        }
    }
}

// ============================================
// Comparison Mode Tab Switching
// ============================================
class ComparisonModeTabs {
    constructor() {
        this.tabsContainer = document.getElementById('comparison-mode-tabs');
        this.overviewContent = document.getElementById('comparison-overview');
        this.detailedContent = document.getElementById('comparison-detailed');

        if (!this.tabsContainer) return;

        this.bindEvents();
    }

    bindEvents() {
        const tabs = this.tabsContainer.querySelectorAll('li');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.getAttribute('data-mode');
                this.switchMode(mode, tabs, tab);
            });
        });
    }

    switchMode(mode, allTabs, activeTab) {
        // Update tab active states
        allTabs.forEach(t => t.classList.remove('is-active'));
        activeTab.classList.add('is-active');

        // Show/hide content
        if (mode === 'overview') {
            this.overviewContent.style.display = 'block';
            this.detailedContent.style.display = 'none';

            // Reset quad slider position when switching to it
            if (window.quadComparison) {
                window.quadComparison.reset();
            }
        } else {
            this.overviewContent.style.display = 'none';
            this.detailedContent.style.display = 'block';
        }
    }
}

// ============================================
// Initialize on DOM Ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the comparison mode tabs
    new ComparisonModeTabs();

    // Initialize the 4-way quad comparison slider for teaser
    window.quadComparison = new QuadImageComparison('quad-comparison');

    // Initialize the 2-way image comparison slider
    new ImageComparisonSlider();
});