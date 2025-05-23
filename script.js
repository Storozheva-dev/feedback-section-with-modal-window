document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM is ready');
    const feedback = document.querySelector('.feedback-section');
    if (!feedback) {
      console.warn('Feedback section відсутній на цій сторінці');
      return;
    }
  
    const loader = document.getElementById('loader');
  
    function showLoader() {
      loader?.classList.replace('hidden', 'show');
    }
  
    function hideLoader() {
      loader?.classList.replace('show', 'hidden');
    }
  
    function generateStars(rating) {
      return Array.from({ length: 5 }, (_, i) => {
        const iconId = i < Math.round(rating) ? 'icon-star-filled' : 'icon-star-empty';
        return `
          <svg class="star-icon" width="20" height="20" fill="currentColor">
            <use href="#${iconId}"></use>
          </svg>
        `;
      }).join('');
    }
  
    async function fetchFeedback() {
      showLoader();
      try {
        const res = await fetch('https://sound-wave.b.goit.study/api/feedbacks');
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const { data } = await res.json();
        return data;
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        return [];
      } finally {
        hideLoader();
      }
    }
  
    async function initFeedbackSwiper() {
      const feedbacks = await fetchFeedback();
      const swiperWrapper = document.querySelector('.swiper-wrapper');
      const paginationContainer = document.querySelector('.custom-pagination');
  
      if (!swiperWrapper || !paginationContainer) {
        console.warn('Не знайдено обгортку слайдера або контейнер пагінації');
        return;
      }
  
      swiperWrapper.innerHTML = '';
      paginationContainer.innerHTML = '';
  
      feedbacks.forEach(feedback => {
        const slide = document.createElement('div');
        slide.classList.add('swiper-slide');
        slide.innerHTML = `
          <div class="feedback-card">
            <div class="feedback-rating">${generateStars(feedback.rating)}</div>
            <p class="feedback-text">${feedback.descr}</p>
            <div class="feedback-info">
              <h3 class="feedback-name">${feedback.name}</h3>
            </div>
          </div>
        `;
        swiperWrapper.appendChild(slide);
      });
  
      const swiper = new Swiper('.feedback-swiper', {
        loop: false,
        navigation: {
          nextEl: '.my-button-next',
          prevEl: '.my-button-prev',
        },
        slidesPerView: 1,
        spaceBetween: 0,
        on: {
            slideChange: () =>
                
            updatePagination(swiper.realIndex, swiper.slides.length),
        },
      });
  
      const prevBtn = document.querySelector('.my-button-prev');
      const nextBtn = document.querySelector('.my-button-next');
  
      function renderCustomPagination(slideCount) {
        const leftDot = document.createElement('span');
        const centerDot = document.createElement('span');
        const rightDot = document.createElement('span');
  
        leftDot.classList.add('pagination-dot');
        centerDot.classList.add('pagination-dot');
        rightDot.classList.add('pagination-dot');
  
        leftDot.dataset.index = 0;
        centerDot.dataset.index = Math.floor(slideCount / 2);
        rightDot.dataset.index = slideCount - 1;
  
        paginationContainer.append(leftDot, centerDot, rightDot);
      }
  
      function updatePagination(activeIndex, slideCount) {
        const dots = document.querySelectorAll('.pagination-dot');
        const [leftDot, centerDot, rightDot] = dots;
      
        leftDot.classList.toggle('active', activeIndex === 0);
        centerDot.classList.toggle(
          'active',
          activeIndex !== 0 && activeIndex !== slideCount - 1
        );
        rightDot.classList.toggle('active', activeIndex === slideCount - 1);
      
        const isFirst = activeIndex === 0;
        const isLast = activeIndex === slideCount - 1;
      
        if (prevBtn) {
          prevBtn.classList.toggle('btn-disabled', isFirst);
          prevBtn.disabled = isFirst;
        }
      
        if (nextBtn) {
          nextBtn.classList.toggle('btn-disabled', isLast);
          nextBtn.disabled = isLast;
        }
      }
  
      paginationContainer.addEventListener('click', e => {
        if (e.target.classList.contains('pagination-dot')) {
          const index = Number(e.target.dataset.index);
          swiper.slideTo(index);
        }
      });
  
      renderCustomPagination(feedbacks.length);
      updatePagination(swiper.realIndex, feedbacks.length);
    }
  
    setTimeout(() => {
      initFeedbackSwiper();
    }, 200);
  
    // Modal Logic
    const modal = document.querySelector('.modal');
    const btnOpen = document.querySelector('.btn-open');
    const btnClose = document.querySelector('.btn-close');
    const form = document.querySelector('.feedback-form');
    const stars = document.querySelectorAll('.star');
  
    let currentRating = 0;
  
    btnOpen.addEventListener('click', () => {
      modal.classList.remove('hidden');
      setTimeout(() => {
        document.body.classList.add('modal-open');
        modal.classList.add('show');
      }, 10);
    });
    const overlay = modal.querySelector('.modal-overlay');

    overlay.addEventListener('click', () => {
      closeModal();
    });
  
    btnClose.addEventListener('click', closeModal);
  
    stars.forEach((star, index) => {
      star.addEventListener('click', () => {
        currentRating = index + 1;
        updateStars(currentRating);
      });
    });
  
    function updateStars(rating) {
      stars.forEach((star, index) => {
        const use = star.querySelector('use');
        if (index < rating) {
          use.setAttribute('href', '#icon-star-filled');
          star.classList.add('active-star');
        } else {
          use.setAttribute('href', '#icon-star-empty');
          star.classList.remove('active-star');
        }
      });
    }
  
    function closeModal() {
      document.body.classList.remove('modal-open');
      modal.classList.remove('show');
      setTimeout(() => {
        modal.classList.add('hidden');
        clearValidationErrors();
        updateStars(0);
        currentRating = 0;
        form.reset();
      }, 300);
    }
  
    function clearValidationErrors() {
      form.querySelectorAll('.error-message').forEach(err => {
        err.classList.add('hidden');
        err.textContent = '';
      });
  
      form.querySelectorAll('.error').forEach(input => {
        input.classList.remove('error');
      });
    }
  
    form.addEventListener('submit', async e => {
      e.preventDefault();
  
      const name = form.elements.name.value.trim();
      const message = form.elements.message.value.trim();
  
      let isValid = true;
  
      const fields = [
        {
          input: form.elements.name,
          errorEl: form.elements.name.nextElementSibling,
          message: 'Should be min 2 - max 10 characters',
          valid: name.length >= 2 && name.length <= 10,
        },
        {
          input: form.elements.message,
          errorEl: form.elements.message.nextElementSibling,
          message: 'Should be min 10 - max 512 characters',
          valid: message.length >= 10 && message.length <= 512,
        },
      ];
  
      fields.forEach(({ input, errorEl, message, valid }) => {
        if (!valid) {
          input.classList.add('error');
          errorEl.textContent = message;
          errorEl.classList.remove('hidden');
          isValid = false;
        } else {
          input.classList.remove('error');
          errorEl.classList.add('hidden');
          errorEl.textContent = '';
        }
      });
  
      if (currentRating < 1) {
        showWarnMsg();
        return;
      }
  
      if (!isValid) return;
  
      showLoader();
  
      try {
        const response = await fetch('https://sound-wave.b.goit.study/api/feedbacks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, rating: currentRating, descr: message }),
        });
        if (!response.ok) throw new Error('Failed to send feedback');
        showSuccessMsg();
        closeModal();
      } catch (error) {
        showErrorMsg();
        console.error(error);
      } finally {
        hideLoader();
      }
    });
  
    function showSuccessMsg() {
      iziToast.success({
        timeout: 3333,
        title: 'Nice!',
        message: `Thanks for the feedback!`,
        position: 'topRight',
      });
    }
  
    function showErrorMsg() {
      iziToast.error({
        timeout: 3333,
        title: 'Error!',
        message: `Error sending. Please try again later.`,
        position: 'topRight',
      });
    }
  
    function showWarnMsg() {
      iziToast.show({
        timeout: 3333,
        message: `Please rank your feedback.`,
        position: 'topLeft',
      });
    }
  });
  