// Set up Axios defaults
axios.defaults.baseURL = "https://api.thecatapi.com/v1/";
axios.defaults.headers.common["x-api-key"] =
  "live_kBH2gxfvfLNN7Q1I3ZhWtKvh5MnM4LgoJFgES871kQxk1oIN68CwyRYr6r6cNJNL"; // Replace with your actual API key

// Function to update the progress bar
function updateProgress(event) {
  console.log("ProgressEvent:", event);
  if (event.lengthComputable) {
    const percentComplete = Math.round((event.loaded / event.total) * 100);
    document.getElementById("progressBar").style.width = `${percentComplete}%`;
  }
}

// Set up Axios interceptors to log request and response times
axios.interceptors.request.use(
  (config) => {
    // Log when the request begins and store the start time
    console.log("Request started at:", new Date().toISOString());
    config.metadata = { startTime: new Date() };

    // Reset progress bar and cursor style
    document.getElementById("progressBar").style.width = "0%";
    document.body.style.cursor = "progress";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    // Calculate and log the time taken for the request
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.log("Request completed at:", endTime.toISOString());
    console.log(`Request duration: ${duration} ms`);

    // Reset progress bar and cursor style
    document.getElementById("progressBar").style.width = "100%";
    document.body.style.cursor = "default";

    return response;
  },
  (error) => {
    // Handle error response
    const endTime = new Date();
    const duration = endTime - error.config.metadata.startTime;
    console.log("Request failed at:", endTime.toISOString());
    console.log(`Request duration: ${duration} ms`);

    // Reset progress bar and cursor style
    document.getElementById("progressBar").style.width = "100%";
    document.body.style.cursor = "default";

    return Promise.reject(error);
  }
);

// Function to initialize the breed selection dropdown
async function alternativeInitialLoad() {
  try {
    // Fetch the list of breeds using Axios
    const response = await axios.get("breeds");
    const breeds = response.data;

    const breedSelect = document.getElementById("breedSelect");
    if (!breedSelect) {
      console.error('No element with ID "breedSelect" found.');
      return;
    }

    breedSelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Select a breed";
    defaultOption.value = "";
    breedSelect.appendChild(defaultOption);

    breeds.forEach((breed) => {
      const option = document.createElement("option");
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });

    // Add event listener for the breed selection
    breedSelect.addEventListener("change", alternativeHandleBreedSelection);
  } catch (error) {
    console.error("Error fetching breeds:", error);
  }
}

// Function to handle breed selection and update the carousel and info section
async function alternativeHandleBreedSelection(event) {
  const breedId = event.target.value;
  if (!breedId) return;

  try {
    // Fetch breed images using Axios with progress tracking
    const imagesResponse = await axios.get("images/search", {
      params: {
        breed_ids: breedId,
        limit: 5,
      },
      onDownloadProgress: updateProgress,
    });
    const images = imagesResponse.data;

    // Get references to the carousel and infoDump elements
    const carouselInner = document.getElementById("carouselInner");
    const infoDump = document.getElementById("infoDump");

    // Clear existing carousel items and infoDump content
    carouselInner.innerHTML = "";
    infoDump.innerHTML = "";

    if (images.length === 0) {
      infoDump.innerHTML = "<p>No information available for this breed.</p>";
      return;
    }

    // Create and append carousel items
    images.forEach((image, index) => {
      const carouselItem = document.createElement("div");
      carouselItem.classList.add("carousel-item");
      if (index === 0) carouselItem.classList.add("active");

      const img = document.createElement("img");
      img.src = image.url;
      img.classList.add("d-block", "w-100");
      img.alt = `Image of ${breedId}`;

      carouselItem.appendChild(img);
      carouselInner.appendChild(carouselItem);
    });

    // Fetch breed details using Axios
    const breedResponse = await axios.get(`breeds/${breedId}`);
    const breedData = breedResponse.data;

    // Populate the infoDump with breed details
    infoDump.innerHTML = `
            <h3>${breedData.name}</h3>
            <p><strong>Origin:</strong> ${breedData.origin}</p>
            <p><strong>Temperament:</strong> ${breedData.temperament}</p>
            <p><strong>Description:</strong> ${breedData.description}</p>
        `;

    // Restart carousel using Bootstrap's Carousel component
    const carousel = new bootstrap.Carousel(
      document.querySelector("#carouselExampleControls")
    );
    carousel.to(0);
  } catch (error) {
    console.error("Error fetching breed information:", error);
  }
}

// Execute the alternativeInitialLoad function immediately when the script loads
alternativeInitialLoad();
