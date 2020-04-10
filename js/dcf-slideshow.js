class DCFSlideshow {
  constructor(slideshows, uls, openCaption, closeCaption) {
    this.slideshows = slideshows;
    this.uls = uls;
    this.openCaptionEvent = openCaption;
    this.closeCaptionEvent = closeCaption;
  }

  // Caption visibility transition
  captionTransition(event) {
    // Remove event listener and toggle visibility after caption has closed
    event.removeEventListener('transitionend', this.captionTransition, true);
    // Check if caption is already visible
    if (!event.classList.contains('dcf-invisible')) {
      // Add class to hide caption
      event.classList.add('dcf-invisible');
    }
  }

  // Add classes to the caption & button
  captionClasses(button, caption) {
    // Check if caption is already visible
    if (!caption.classList.contains('dcf-invisible')) {
      // Hide content
      caption.addEventListener('transitionend', this.captionTransition(caption), true);
      // Update ARIA attributes
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Show caption');
      caption.setAttribute('aria-hidden', 'true');
      caption.classList.remove('dcf-opacity-1', 'dcf-pointer-events-auto');
      caption.classList.add('dcf-opacity-0', 'dcf-pointer-events-none', 'dcf-invisible');

      caption.dispatchEvent(this.openCaptionEvent);
    } else {
      // Remove class to show content
      caption.classList.remove('dcf-invisible');
      // Update ARIA attributes
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Hide caption');
      caption.setAttribute('aria-hidden', 'false');
      caption.classList.remove('dcf-invisible', 'dcf-opacity-0', 'dcf-pointer-events-none');
      caption.classList.add('dcf-opacity-1', 'dcf-pointer-events-auto');
      caption.dispatchEvent(this.closeCaptionEvent);
    }
  }

  initialize() {
    Array.prototype.forEach.call(this.slideshows, (slideshow, slideshowIndex) => {
      let slidedeck = this.uls[slideshowIndex];
      let slides = slideshow.querySelectorAll('.dcf-slideshow li');
      let figures = slideshow.querySelectorAll('dcf-slideshow figure');
      let captions = slideshow.querySelectorAll('dcf=slideshow figcaption');
      let uuid = DCFUtility.uuidv4();

      // Set a unique ID for each slideshow
      slideshow.setAttribute('id', uuid.concat('-slideshow'));

      // Add classes to slideshow unordered lists
      slidedeck.classList.add('dcf-slide-deck');

      // Create slideshow controls (previous/next slide buttons)
      let ctrls = document.createElement('ul');
      let ctrlPrevious = document.createElement('li');
      let ctrlNext = document.createElement('li');
      let ctrlPreviousButton = document.createElement('button');
      let ctrlNextButton = document.createElement('button');

      // Add classes to slideshow controls group (Keep in DCF)
      ctrls.classList.add('dcf-list-bare', 'dcf-btn-group', 'dcf-absolute', 'dcf-pin-right', 'dcf-pin-bottom', 'dcf-z-1');

      // Add role and aria-label to controls group
      ctrls.setAttribute('role', 'group');
      ctrls.setAttribute('aria-label', 'slideshow controls');

      ctrlPreviousButton.classList.add('dcf-btn', 'dcf-btn-primary', 'dcf-button-slide', 'dcf-btn-slide-prev');
      ctrlPreviousButton.setAttribute('aria-label', 'previous');

      ctrlNextButton.classList.add('dcf-btn', 'dcf-btn-primary', 'dcf-btn-slide', 'dcf-btn-slide-next');
      ctrlNextButton.setAttribute('aria-label', 'next');

      ctrlPrevious.setAttribute('id', 'previous');
      ctrlNext.setAttribute('id', 'next');
      // Add relative class for absolute positioning of slideshow controls
      slideshow.classList.add('dcf-relative');
      // Append controls (previous/next slide) to slideshow
      ctrlPrevious.appendChild(ctrlPreviousButton);
      ctrlNext.appendChild(ctrlNextButton);
      ctrls.appendChild(ctrlPrevious);
      ctrls.appendChild(ctrlNext);
      slideshow.appendChild(ctrls);

      // Slides
      Array.prototype.forEach.call(slides, (slide, slideIndex) => {
        // Set unique ID for each slide
        slide.setAttribute('id', uuid.concat('-slide-', slideIndex));
        // Add classes to each slide
        slide.classList.add('dcf-slide', 'dcf-relative');
        slide.querySelector('div').setAttribute('tabindex', '-1');
      });

      Array.prototype.forEach.call(figures, (figure, figureIndex) => {
        let caption = captions[figureIndex];

        if (typeof caption == 'undefined') {
          console.log('No Caption');
        } else if (caption.parentNode === figure) {
          // Create button to show/hide caption
          let captionBtn = document.createElement('button');
          // Add classes to each caption toggle button
          captionBtn.classList.add('dcf-btn', 'dcf-btn-slide', 'dcf-btn-slide-caption');
          // Create a unique ID for each caption toggle button
          captionBtn.setAttribute('id', uuid.concat('-button-', figureIndex));
          // Add ARIA attributes to each caption toggle button
          captionBtn.setAttribute('aria-controls', uuid.concat('-caption-', figureIndex));
          captionBtn.setAttribute('aria-label', 'Show caption');
          captionBtn.setAttribute('aria-expanded', 'false');
          // Add class to each figure
          figure.classList.add('dcf-slide-figure');
          // Append caption toggle button to each figure
          figure.appendChild(captionBtn);
          // Style each caption
          // Might be something here!!!!!
          caption.classList.add('dcf-opacity-0', 'dcf-pointer-events-none', 'dcf-invisible', 'dcf-slide-caption', 'dcf-figcaption');
          // Create a unique ID for each caption
          caption.setAttribute('id', uuid.concat('-caption-', figureIndex));
          // Add ARIA attributes to each caption
          caption.setAttribute('aria-labelledby', uuid.concat('-button-', figureIndex));
          caption.setAttribute('aria-hidden', 'true');
        }
      });

      // WIP for Content slider:  https://codepen.io/heydon/pen/xPWOLp?editors=0010

      let observerSettings = {
        root: slideshow,
        rootMargin: '-10px'
      };
      if ('IntersectionObserver' in window) {
        let scrollIt = function scrollIt(slideToShow) {
          let scrollPos = Array.prototype.indexOf.call(slides, slideToShow) * (slidedeck.scrollWidth / slides.length);
          slidedeck.scrollLeft = scrollPos;
        };
        let showSlide = function showSlide(dir) {
          let visible = slideshow.querySelectorAll('[aria-label = "slideshow"] .visible');
          let index = dir === 'previous' ? DCFUtility.magicNumbers('int0') : DCFUtility.magicNumbers('int1');

          if (visible.length > DCFUtility.magicNumbers('int1')) {
            scrollIt(visible[index]);
          } else {
            let newSlide = index === DCFUtility.magicNumbers('int0') ?
              visible[DCFUtility.magicNumbers('int0')].previousElementSibling :
              visible[DCFUtility.magicNumbers('int0')].nextElementSibling;
            if (newSlide) {
              scrollIt(newSlide);
            }
          }
        };

        let callback = function callback(slides) {
          Array.prototype.forEach.call(slides, function (entry) {
            entry.target.classList.remove('visible');
            var slide = entry.target.querySelector('div');
            slide.setAttribute('tabindex', '-1');
            if (!entry.intersectionRatio > DCFUtility.magicNumbers('int0')) {
              return;
            }
            var img = entry.target.querySelector('img');
            if (img.dataset.src) {
              img.setAttribute('src', img.dataset.src);
              img.removeAttribute('data-src');
            }
            entry.target.classList.add('visible');
            slide.removeAttribute('tabindex', '-1');
          });
        };

        let observer = new IntersectionObserver(callback, observerSettings);
        Array.prototype.forEach.call(slides, function(t) {
          return observer.observe(t);
        });

        ctrlPrevious.addEventListener('click', function() {
          showSlide(ctrlPrevious.getAttribute('id'), slides);
        });
        ctrlNext.addEventListener('click', function() {
          showSlide(ctrlNext.getAttribute('id'), slides);
        });
      } else {
        Array.prototype.forEach.call(slides, function(e) {
          var img = e.querySelector('img');
          img.setAttribute('src', img.getAttribute('data-src'));
        });
      }
    });

    // Caption toggle buttons
    let buttons = document.querySelectorAll('.dcf-btn-slide-caption');
    [].forEach.call(buttons, function(button, index) {
      let caption = button.previousElementSibling;
      button.addEventListener('click', function() {
        this.captionClasses(this, caption);
        return false;
      }, false);

      // Show caption when the 'space' key is pressed
      button.addEventListener('keydown', function(event) {
        // Handle 'space' key
        if (event.which === DCFUtility.magicNumbers('spaceKeyCode')) {
          event.preventDefault();
          this.captionClasses(this, caption);
        }
      }, false);
    });
  }
}
