// Splash screen
setTimeout(() => {
  document.getElementById('splash-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
}, 2000);

// Google Sheets CSV URL (with timestamp to avoid cache)
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSqeus79UjHIdABYDSnbY6yUuow6rl_4BAf1GDqsOUuoZWUBZlDITJnkQ7NnXhLgeeTJNtsuxcwc8Pj/pub?gid=0&single=true&output=csv&t=" + new Date().getTime();

const gallery = document.getElementById('gallery');
const categoryFilter = document.getElementById('category-filter');
let allImages = [];
let currentIndex = 0;

fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split('\n').slice(1);
    const categories = new Set();

    rows.forEach((row, i) => {
      const [urlRaw, categoryRaw] = row.split(',');
      const url = urlRaw?.replace(/"/g, '').trim();
      const category = (categoryRaw || 'Uncategorized').replace(/"/g, '').trim();

      if (url) {
        allImages.push({ url, category });

        if (category) categories.add(category);
      }
    });

    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });

    renderImages(allImages);
  });

function renderImages(images) {
  gallery.innerHTML = '';
  imageUrls = images.map(i => i.url);

  images.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'image-tile';
    const img = document.createElement('img');
    img.src = item.url;
    img.setAttribute('data-index', i);
    img.alt = `Image ${i + 1}`;
    div.appendChild(img);
    div.addEventListener('click', () => openModal(i));
    gallery.appendChild(div);
  });
}

// Filter logic
categoryFilter.addEventListener('change', () => {
  const selected = categoryFilter.value;
  if (selected === 'All') {
    renderImages(allImages);
  } else {
    const filtered = allImages.filter(img => img.category === selected);
    renderImages(filtered);
  }
});

// Modal functionality
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const closeBtn = document.getElementById('close');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let imageUrls = [];

function openModal(i) {
  currentIndex = i;
  modalImg.src = imageUrls[i];
  modal.style.display = 'block';
}

function closeModal() { modal.style.display = 'none'; }
function showNext() {
  currentIndex = (currentIndex + 1) % imageUrls.length;
  modalImg.src = imageUrls[currentIndex];
}
function showPrev() {
  currentIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length;
  modalImg.src = imageUrls[currentIndex];
}

// Touch/swipe support
let touchStartX = 0;
modal.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});
modal.addEventListener('touchend', e => {
  const deltaX = e.changedTouches[0].screenX - touchStartX;
  if (deltaX > 50) showPrev();
  else if (deltaX < -50) showNext();
});

closeBtn.onclick = closeModal;
nextBtn.onclick = showNext;
prevBtn.onclick = showPrev;
modal.onclick = e => { if (e.target === modal) closeModal(); };
document.addEventListener('keydown', e => {
  if (modal.style.display === 'block') {
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'Escape') closeModal();
  }
});