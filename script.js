// Splash
setTimeout(() => {
  document.getElementById('splash-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
}, 2000);

// Tap Sound
const tapSound = document.getElementById('tap-sound');

// Sheet CSV
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSqeus79UjHIdABYDSnbY6yUuow6rl_4BAf1GDqsOUuoZWUBZlDITJnkQ7NnXhLgeeTJNtsuxcwc8Pj/pub?gid=0&single=true&output=csv&t=" + new Date().getTime();

const gallery = document.getElementById('gallery');
const categoryFilter = document.getElementById('category-filter');
const spinner = document.getElementById('spinner');

let allImages = [];
let filteredImages = [];
let currentIndex = 0;
let loadedCount = 0;
const batchSize = 12;

// Fetch and parse
fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split('\n').slice(1).reverse();
    const categories = new Set();

    rows.forEach((row, i) => {
      let [url, cat] = row.split(',').map(x => x.replace(/"/g, '').trim());
      if (url) {
        categories.add(cat || 'Uncategorized');
        allImages.push({ url, category: cat || 'Uncategorized' });
      }
    });

    // Fill category dropdown
    [...categories].sort().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      categoryFilter.appendChild(opt);
    });

    filteredImages = allImages;
    loadBatch();
  });

function loadBatch() {
  spinner.style.display = 'block';
  setTimeout(() => {
    const nextBatch = filteredImages.slice(loadedCount, loadedCount + batchSize);
    nextBatch.forEach((imgData, i) => {
      const div = document.createElement('div');
      div.className = 'image-tile';
      const img = document.createElement('img');
      img.src = imgData.url;
      img.alt = `Image`;
      img.dataset.index = loadedCount + i;
      div.appendChild(img);
      div.addEventListener('click', () => openModal(parseInt(img.dataset.index)));
      gallery.appendChild(div);
    });
    loadedCount += batchSize;
    spinner.style.display = 'none';
  }, 500);
}

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
    if (loadedCount < filteredImages.length) {
      loadBatch();
    }
  }
});

categoryFilter.addEventListener('change', () => {
  const selected = categoryFilter.value;
  gallery.innerHTML = '';
  loadedCount = 0;
  filteredImages = selected === 'all'
    ? allImages
    : allImages.filter(img => img.category === selected);
  loadBatch();
});

// Modal
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const closeBtn = document.getElementById('close');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

function openModal(i) {
  tapSound.play();
  currentIndex = i;
  modalImg.src = filteredImages[i].url;
  modal.style.display = 'block';
}
function closeModal() {
  modal.style.display = 'none';
}
function showNext() {
  tapSound.play();
  currentIndex = (currentIndex + 1) % filteredImages.length;
  modalImg.src = filteredImages[currentIndex].url;
}
function showPrev() {
  tapSound.play();
  currentIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
  modalImg.src = filteredImages[currentIndex].url;
}

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