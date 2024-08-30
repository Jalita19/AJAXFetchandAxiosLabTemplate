import axios from "axios";
import * as Carousel from "./Carousel.js";

const breedSelect = document.getElementById("breedSelect");
const infoDump = document.getElementById("infoDump");
const progressBar = document.getElementById("progressBar");
const getFavouritesBtn = document.getElementById("getFavouritesBtn");
const carouselInner = document.getElementById("carouselInner");

const API_KEY =
  "live_kBH2gxfvfLNN7Q1I3ZhWtKvh5MnM4LgoJFgES871kQxk1oIN68CwyRYr6r6cNJNL";
axios.defaults.baseURL = "https://api.thecatapi.com/v1";
axios.defaults.headers.common["x-api-key"] = API_KEY;

// Axios request and response interceptors for progress bar
axios.interceptors.request.use(
  (config) => {
    progressBar.style.width = "0%";
    document.body.style.cursor = "progress";
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => {
    document.body.style.cursor = "";
    return response;
  },
  (error) => {
    document.body.style.cursor = "";
    return Promise.reject(error);
  }
);

function updateProgress(event) {
  if (event.lengthComputable) {
    const percentComplete = (event.loaded / event.total) * 100;
    progressBar.style.width = `${percentComplete}%`;
  }
}

async function fetchBreeds() {
  try {
    const { data } = await axios.get("/breeds");
    return data;
  } catch (error) {
    console.error("Error fetching breeds:", error);
    throw error;
  }
}

async function fetchBreedData(breedId) {
  try {
    const [imagesResponse, breedResponse] = await Promise.all([
      axios.get("/images/search", {
        params: { breed_id: breedId, limit: 10 },
        onDownloadProgress: updateProgress,
      }),
      axios.get(`/breeds/${breedId}`),
    ]);

    const images = imagesResponse.data;
    const breedData = breedResponse.data;

    updateCarousel(images);
    infoDump.innerHTML = `
      <h3>${breedData.name}</h3>
      <p><strong>Origin:</strong> ${breedData.origin}</p>
      <p><strong>Temperament:</strong> ${breedData.temperament}</p>
      <p><strong>Description:</strong> ${breedData.description}</p>
    `;
  } catch (error) {
    console.error("Error fetching breed data:", error);
  }
}

function updateCarousel(images) {
  carouselInner.innerHTML = "";
  images.forEach((image) => {
    const imgElement = Carousel.createCarouselItem(
      image.url,
      "Cat image",
      image.id
    );
    Carousel.appendCarousel(imgElement);
  });
  Carousel.start();
}

function populateBreedSelect(breeds) {
  breedSelect.innerHTML = "";
  breeds.forEach((breed) => {
    const option = document.createElement("option");
    option.value = breed.id;
    option.textContent = breed.name;
    breedSelect.appendChild(option);
  });
}

async function getFavourites() {
  try {
    const { data: favourites } = await axios.get("/favourites");
    updateCarousel(favourites.map((fav) => ({ url: fav.image.url })));
  } catch (error) {
    console.error("Error fetching favourites:", error);
  }
}

async function initialLoad() {
  try {
    const breeds = await fetchBreeds();
    populateBreedSelect(breeds);
    if (breeds.length > 0) {
      fetchBreedData(breeds[0].id);
    }

    breedSelect.addEventListener("change", (event) => {
      const breedId = event.target.value;
      if (breedId) fetchBreedData(breedId);
    });

    getFavouritesBtn.addEventListener("click", getFavourites);
  } catch (error) {
    console.error("Error during initial load:", error);
  }
}

document.addEventListener("DOMContentLoaded", initialLoad);

// Export the favourite function
export async function favourite(imgId) {
  try {
    const { data: favourites } = await axios.get("/favourites");
    const isFavourited = favourites.some((fav) => fav.image_id === imgId);

    if (isFavourited) {
      await axios.delete(`/favourites/${imgId}`);
    } else {
      await axios.post("/favourites", { image_id: imgId });
    }

    const selectedBreedId = breedSelect.value;
    if (selectedBreedId) fetchBreedData(selectedBreedId);
  } catch (error) {
    console.error("Error toggling favourite:", error);
  }
}
