// Find our date picker inputs on the page
const API_KEY = "qRy4gPOQDrePl0927JUXQplpykShTYYpHvDpZyrB"
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const loadingMessage = document.getElementById('loading-message');
const spaceFact = document.getElementById('space-fact');
const apodModal = document.getElementById('apodModal');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalImage = document.getElementById('modalImage');
const modalExplanation = document.getElementById('modalExplanation');
const getButton = document.querySelector('.filters button');

const spaceFacts = [
  'A day on Venus is longer than a year on Venus.',
  'Jupiter has the shortest day of all the planets, rotating once every 10 hours.',
  'The Sun makes up 99.86% of the mass of the solar system.',
  'A teaspoon of neutron star would weigh about 6 billion tons on Earth.',
  'There are more stars in the observable universe than grains of sand on all Earth’s beaches.',
  'The footprints on the Moon will likely last 100 million years or more because there is no wind.',
  'Saturn is not the only ringed planet; Jupiter, Uranus, and Neptune have rings too.',
  'Neptune takes 165 Earth years to orbit the Sun.',
  'The Great Red Spot on Jupiter is a giant storm that has existed for at least 350 years.',
  'Mars has the tallest volcano in the solar system: Olympus Mons.'
];

function displayRandomSpaceFact() {
  if (!spaceFact) return;
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  spaceFact.textContent = spaceFacts[randomIndex];
}

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

displayRandomSpaceFact();

// Fetch NASA APOD data for a date range and show a loading message.
// Returns an array of APOD items (or an empty array on error).
async function fetchApodRange() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    alert('Please pick both a start date and an end date.');
    return [];
  }

  loadingMessage.textContent = 'Loading space photos…';

  const endpoint = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`NASA APOD request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // If data is a single object (single-day API behavior), normalize to array.
    return Array.isArray(data) ? data : [data];

  } catch (error) {
    console.error(error);
    gallery.innerHTML = `<p>Could not load data: ${error.message}</p>`;
    return [];
  } finally {
    loadingMessage.textContent = '';
  }
}

// Optional button hook to call the function when user clicks
function showModal(item) {
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;

  if (item.media_type === 'image') {
    modalImage.src = item.url;
    modalImage.alt = item.title;
    modalImage.style.display = 'block';
  } else {
    modalImage.style.display = 'none';
  }

  apodModal.classList.remove('hidden');
  apodModal.setAttribute('aria-hidden', 'false');
}

function hideModal() {
  apodModal.classList.add('hidden');
  apodModal.setAttribute('aria-hidden', 'true');
}

function renderApodGallery(apodItems) {
  // Clear existing gallery content.
  gallery.innerHTML = '';

  // Loop through each APOD item and append an element.
  apodItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-item'; // align with CSS
    card.tabIndex = 0;

    const title = document.createElement('h3');
    title.textContent = item.title;
    card.appendChild(title);

    const date = document.createElement('p');
    date.textContent = item.date;
    card.appendChild(date);

    if (item.media_type === 'image') {
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = item.title;
      card.appendChild(img);
    } else if (item.media_type === 'video') {
      // try to show a thumbnail when available, or just a link.
      if (item.thumbnail_url) {
        const thumb = document.createElement('img');
        thumb.src = item.thumbnail_url;
        thumb.alt = `${item.title} (video thumbnail)`;
        card.appendChild(thumb);
      }

      const videoLink = document.createElement('a');
      videoLink.href = item.url;
      videoLink.target = '_blank';
      videoLink.rel = 'noopener noreferrer';
      videoLink.textContent = 'Watch video';
      videoLink.style.display = 'inline-block';
      videoLink.style.marginTop = '8px';
      card.appendChild(videoLink);
    } else {
      const msg = document.createElement('p');
      msg.textContent = `(Unsupported media_type: ${item.media_type})`;
      card.appendChild(msg);
    }

    card.addEventListener('click', () => showModal(item));
    card.addEventListener('keyup', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        showModal(item);
      }
    });

    gallery.appendChild(card);
  });
}

modalClose.addEventListener('click', hideModal);
apodModal.addEventListener('click', (event) => {
  if (event.target === apodModal) {
    hideModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !apodModal.classList.contains('hidden')) {
    hideModal();
  }
});

getButton.addEventListener('click', async () => {
  const apodItems = await fetchApodRange();

  if (apodItems.length === 0) {
    return;
  }

  renderApodGallery(apodItems);
});
