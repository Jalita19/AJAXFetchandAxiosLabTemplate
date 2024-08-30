import * as bootstrap from "bootstrap";
import { favourite } from "./index.js";

export function createCarouselItem(imgSrc, imgAlt, imgId) {
  const template = document.querySelector("#carouselItemTemplate");
  const clone = template.content.firstElementChild.cloneNode(true);

  const img = clone.querySelector("img");
  img.src = imgSrc;
  img.alt = imgAlt;

  const favBtn = clone.querySelector(".favourite-button");
  favBtn.addEventListener("click", () => {
    favourite(imgId);
  });

  return clone;
}

export function clear() {
  const carousel = document.querySelector("#carouselInner");
  while (carousel.firstChild) {
    carousel.removeChild(carousel.firstChild);
  }
}

export function appendCarousel(element) {
  const carousel = document.querySelector("#carouselInner");

  const activeItem = document.querySelector(".carousel-item.active");
  if (!activeItem) element.classList.add("active");

  carousel.appendChild(element);
}

export function start() {
  const multipleCardCarousel = document.querySelector(
    "#carouselExampleControls"
  );
  if (window.matchMedia("(min-width: 768px)").matches) {
    const carousel = new bootstrap.Carousel(multipleCardCarousel, {
      interval: false,
    });
    const carouselWidth = $(".carousel-inner")[0].scrollWidth;
    const cardWidth = $(".carousel-item").width();
    let scrollPosition = 0;
    $("#carouselExampleControls .carousel-control-next").unbind();
    $("#carouselExampleControls .carousel-control-next").on(
      "click",
      function () {
        if (scrollPosition < carouselWidth - cardWidth * 4) {
          scrollPosition += cardWidth;
          $("#carouselExampleControls .carousel-inner").animate(
            { scrollLeft: scrollPosition },
            600
          );
        }
      }
    );
    $("#carouselExampleControls .carousel-control-prev").unbind();
    $("#carouselExampleControls .carousel-control-prev").on(
      "click",
      function () {
        if (scrollPosition > 0) {
          scrollPosition -= cardWidth;
          $("#carouselExampleControls .carousel-inner").animate(
            { scrollLeft: scrollPosition },
            600
          );
        }
      }
    );
  } else {
    $(multipleCardCarousel).addClass("slide");
  }
}
// // Axios instance for easier configuration
// const axiosInstance = axios.create({
//   baseURL: "https://api.thecatapi.com/v1/",
//   headers: {
//     "x-api-key": "live_kBH2gxfvfLNN7Q1I3ZhWtKvh5MnM4LgoJFgES871kQxk1oIN68CwyRYr6r6cNJNL", // Replace with your actual API key
//   },
// });

// // Function to handle toggling the favorite status of an image
// export async function favourite(imageId) {
//   try {
//     // Check if the image is already favorited
//     const response = await axiosInstance.get("favourites", {
//       params: { image_ids: imageId },
//     });

//     const favourites = response.data;

//     if (favourites.length > 0) {
//       // If image is already in favorites, remove it
//       await axiosInstance.delete(`favourites/${favourites[0].id}`);
//       console.log(`Removed image ${imageId} from favorites.`);
//     } else {
//       // If image is not in favorites, add it
//       await axiosInstance.post("favourites", { image_id: imageId });
//       console.log(`Added image ${imageId} to favorites.`);
//     }
//   } catch (error) {
//     console.error("Error toggling favorite status:", error);
//   }
// }
