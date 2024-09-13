import * as Carousel from "./Carousel.js";
// import axios from "axios";
// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");
// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_abkewYAx34ag2Z3tQyNinQi2SIvIi56wq2V0UmGbemppBmDeE6pEf5ajkH8yfOXN";
document.addEventListener("DOMContentLoaded", initialLoad);
async function initialLoad() {
  const res = await fetch("https://api.thedogapi.com/v1/breeds", {
    headers: { "x-api-key": API_KEY },
  });
  const data = await res.json();
  console.log(data);
  data.forEach((obj) => {
    const option = document.createElement("option");
    option.textContent = obj.name;
    option.setAttribute("value", obj.id);
    breedSelect.appendChild(option);
  });
  axiosHandleBreedSelect();
  Carousel.start();
}
breedSelect.addEventListener("change", axiosHandleBreedSelect);
async function handleBreedSelect() {
  console.log(breedSelect.value);
  // fetching data by the breed id
  const res = await fetch(
    `https://api.thedogapi.com/v1/images/search?limit=10&breed_ids=${breedSelect.value}`,
    {
      headers: { "x-api-key": API_KEY },
    }
  );
  const breedsData = await res.json();
  console.log(breedsData);
  // clear the carousel if it has any images
  if (document.getElementById("carouselInner").firstChild) {
    Carousel.clear();
  }
  // create and append images to carousel
  breedsData.forEach((item) => {
    const element = Carousel.createCarouselItem(
      item.url,
      item.breeds[0].name,
      item.id
    );
    Carousel.appendCarousel(element);
  });
  // check if there is a child element on the infoDump div
  if (infoDump.firstChild) {
    infoDump.firstChild.remove();
  }
  //TODO: be more creative
  // create a new element for the info
  const p = document.createElement("p");
  p.textContent = breedsData[0].breeds[0].description;
  infoDump.appendChild(p);
  // TODO
  Carousel.start();
}
axios.defaults.headers.common["x-api-key"] = API_KEY;
async function axiosHandleBreedSelect() {
  console.log(breedSelect.value);
  const res = await axios.get(
    `https://api.thedogapi.com/v1/images/search?limit=10&breed_ids=${breedSelect.value}`,
    {
      onDownloadProgress: updateProgress,
    }
  );
  // parsed json data
  const breedsData = res.data;
  console.log(breedsData);
  // clear the carousel if it has any images
  if (document.getElementById("carouselInner").firstChild) {
    Carousel.clear();
  }
  // create and append images to carousel
  breedsData.forEach((item) => {
    const element = Carousel.createCarouselItem(
      item.url,
      item.breeds[0].name,
      item.id
    );
    Carousel.appendCarousel(element);
  });
  // check if there is a child element on the infoDump div
  if (infoDump.firstChild) {
    infoDump.firstChild.remove();
  }
  //TODO: be more creative
  // create a new element for the info
  const p = document.createElement("p");
  p.textContent = breedsData[0].breeds[0].description;
  infoDump.appendChild(p);
  // TODO
  Carousel.start();
}
// Interceptors
axios.interceptors.request.use((request) => {
  request.metadata = request.metadata || {};
  request.metadata.startTime = new Date().getTime();
  console.log("Sending request....");
  // reset the progressBar to 0
  progressBar.style.width = "0px";
  // sets the cursor to 'progress or loading'
  document.body.style.cursor = "progress";
  return request;
});
// Response Interceptor
axios.interceptors.response.use(
  (response) => {
    response.config.metadata.endTime = new Date().getTime();
    response.config.metadata.durationInMS =
      response.config.metadata.endTime - response.config.metadata.startTime;
    console.log("Response completed....");
    // sets the body cursor to default
    document.body.style.cursor = "";
    console.log(
      `Request took ${response.config.metadata.durationInMS} milliseconds.`
    );
    return response;
  },
  (error) => {
    error.config.metadata.endTime = new Date().getTime();
    error.config.metadata.durationInMS =
      error.config.metadata.endTime - error.config.metadata.startTime;
    console.log(
      `Request took ${error.config.metadata.durationInMS} milliseconds.`
    );
    throw error;
  }
);
function updateProgress(progressEvent) {
  console.log(progressEvent);
  if (progressEvent.lengthComputable) {
    progressBar.style.width = progressEvent.total + "px";
  }
}
export async function favourite(imgId) {
  console.log(imgId);
  //   GET all favourites
  axios.get("https://api.thedogapi.com/v1/favourites").then((res) => {
    console.log("FAVS => ", res.data);
    let deleted = false;
    // loop over the items
    res.data.forEach((item) => {
      // if the image is favourited then delete
      if (item.image_id === imgId) {
        console.log(item.image_id, imgId);
        // delete
        deleted = true;
        axios
          .delete(`https://api.thedogapi.com/v1/favourites/${item.id}`)
          .then((res) => console.log(res));
      }
    });
    if (!deleted) {
      // add
      axios
        .post("https://api.thedogapi.com/v1/favourites", {
          image_id: imgId,
          sub_id: "abe",
        })
        .then((res) => console.log(res.data));
    }
  });
}
getFavouritesBtn.addEventListener("click", getFavourites);
function getFavourites() {
  axios.get("https://api.thedogapi.com/v1/favourites").then((res) => {
    console.log("All FAVS::: ", res.data);
    Carousel.clear();
    res.data.forEach((item) => {
      const element = Carousel.createCarouselItem(
        item.image.url,
        item.image_id,
        item.image.id
      );
      Carousel.appendCarousel(element);
    });
  });
  Carousel.start();
}