// Example of how to initialize a map (you'll need to adapt this to your chosen map library)
document.addEventListener("DOMContentLoaded", function () {
  // Example with a placeholder map. Replace with your actual map initialization.
  const map = L.map("charity-signup-map").setView([0, 0], 2); // Example using Leaflet
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  let marker = null;
  map.on("click", function (e) {
    if (marker) {
      map.removeLayer(marker);
    }
    marker = L.marker(e.latlng).addTo(map);
    document.getElementById("charity-signup-latitude").value = e.latlng.lat;
    document.getElementById("charity-signup-longitude").value = e.latlng.lng;
  });

  document
    .getElementById("charity-signup-submit")
    .addEventListener("click", function () {
      // Collect form data and send to your backend
      const name = document.getElementById("charity-signup-name").value;
      const email = document.getElementById("charity-signup-email").value;
      const address = document.getElementById("charity-signup-address").value;
      const mission = document.getElementById("charity-signup-mission").value;
      const latitude = document.getElementById("charity-signup-latitude").value;
      const longitude = document.getElementById(
        "charity-signup-longitude"
      ).value;
      const categories = Array.from(
        document.querySelectorAll(
          '#charity-signup-categories input[type="checkbox"]:checked'
        )
      ).map((el) => el.value);

      // Send data to backend (example using fetch)
      fetch("/api/charity/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          address,
          mission,
          latitude,
          longitude,
          categories,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Handle successful signup (e.g., close modal, show success message)
            $("#charity-signup-modal").modal("hide");
          } else {
            // Handle signup errors (e.g., display error message)
            document.getElementById("charity-signup-error").textContent =
              data.message;
          }
        });
    });
});
