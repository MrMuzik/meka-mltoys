'use strict';

(function () {
  if (!customElements.get('video-carousel')) {
    class VideoCarousel extends HTMLElement {
      constructor() {
        super();
        this.swiper = null;
        this.slider = null;
        this.playButtons = [];
        this.currentPlayingVideo = null;
        this.resizeTimeout = null;
        this.onResize = this.handleResize.bind(this);
      }

      connectedCallback() {
        this.init();
        window.addEventListener('resize', this.onResize);
      }

      disconnectedCallback() {
        this.cleanup();
      }

      init() {
        this.setupElements();
        this.initSwiper();
        this.bindEvents();
      }

      setupElements() {
        this.slider = this.querySelector('.swiper');
        this.playButtons = this.querySelectorAll('.video-carousel__play-button');
      }

      initSwiper() {
        if (!this.slider || this.swiper) return;

        const sectionId = this.dataset.sectionId;
        if (!sectionId) return;

        const autoplay = this.dataset.autoplay === 'true';
        const loop = this.dataset.loop === 'true';
        const speed = parseInt(this.dataset.speed) * 1000;

        this.swiper = new Swiper(`.video-carousel-${sectionId}`, {
          slidesPerView: 1,
          spaceBetween: 20,
          loop: loop,
          grabCursor: true,
          autoplay: autoplay ? {
            delay: speed,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          } : false,
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true
          },
          breakpoints: {
            480: {
              slidesPerView: 'auto',
              spaceBetween: 20
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 20
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30
            }
          },
          on: {
            slideChange: () => {
              this.pauseAllVideos();
            }
          }
        });
      }

      bindEvents() {
        this.playButtons.forEach(button => {
          button.addEventListener('click', this.handlePlayClick.bind(this));
        });

        // Handle clicks outside videos to pause
        document.addEventListener('click', (e) => {
          if (!e.target.closest('.video-carousel__item')) {
            this.pauseAllVideos();
          }
        });

        // Handle escape key to pause videos
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            this.pauseAllVideos();
          }
        });
      }

      handlePlayClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const videoContainer = button.closest('.video-carousel__video-container');
        const thumbnail = videoContainer.querySelector('.video-carousel__thumbnail');
        const iframeContainer = videoContainer.querySelector('.video-carousel__iframe-container');
        const youtubeId = thumbnail.dataset.youtubeId;

        if (!youtubeId) return;

        // Pause any currently playing video
        this.pauseAllVideos();

        // Create and show YouTube iframe
        this.loadYouTubeVideo(iframeContainer, youtubeId, thumbnail);

        // Pause swiper autoplay when video starts
        if (this.swiper && this.swiper.autoplay) {
          this.swiper.autoplay.stop();
        }

        this.currentPlayingVideo = iframeContainer;
      }

      loadYouTubeVideo(container, videoId, thumbnail) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.className = 'video-carousel__iframe';

        container.innerHTML = '';
        container.appendChild(iframe);
        container.style.display = 'block';
        thumbnail.style.display = 'none';

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'video-carousel__close-button';
        closeButton.innerHTML = '×';
        closeButton.setAttribute('aria-label', 'Close video');
        closeButton.addEventListener('click', () => {
          this.pauseVideo(container, thumbnail);
        });
        container.appendChild(closeButton);
      }

      pauseVideo(container, thumbnail) {
        container.style.display = 'none';
        container.innerHTML = '';
        thumbnail.style.display = 'block';

        // Resume swiper autoplay
        if (this.swiper && this.swiper.autoplay && this.dataset.autoplay === 'true') {
          this.swiper.autoplay.start();
        }

        if (this.currentPlayingVideo === container) {
          this.currentPlayingVideo = null;
        }
      }

      pauseAllVideos() {
        const allIframeContainers = this.querySelectorAll('.video-carousel__iframe-container');
        const allThumbnails = this.querySelectorAll('.video-carousel__thumbnail');

        allIframeContainers.forEach((container, index) => {
          if (container.style.display !== 'none') {
            this.pauseVideo(container, allThumbnails[index]);
          }
        });
      }

      handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
          if (this.swiper) {
            this.swiper.update();
          }
        }, 200);
      }

      cleanup() {
        this.pauseAllVideos();

        if (this.swiper) {
          this.swiper.destroy(true, true);
          this.swiper = null;
        }

        window.removeEventListener('resize', this.onResize);
      }
    }

    customElements.define('video-carousel', VideoCarousel);
  }
})();
