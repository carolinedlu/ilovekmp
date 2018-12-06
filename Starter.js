var airports = 0;
var map;

Backend.Authenticate();

async function buildModelsInterface() {
	let body = $('body');
	emptyInterface(); //Clear page
	body.append('<h1 class=modelHeader">Select an airplane model:</h1>');
	const models = await Backend.GetPlanes();
	body.append('<select id="dropDown"><option selected="true" disabled="true">Select a model</option></select><br><br>');

    for (const model of models) {
        let option = document.createElement("option");
        option.text = model.name;
        option.value = model.name;
        document.getElementById("dropDown").options.add(option); //Add plane to drop-down menu
    }

	let selected_model = null;

	body.append('<div class="menuDiv"></div>');
	body.append('<div class="newDiv"></div>');
	body.append('<div class="revDiv"></div>');

   // const passengers_button = $('<button id="passengers">Passengers</button>').click(() => {
    //    if (selected_model !== null) {
     //       buildPassengersInterface(selected_model);
      //  }
    //});
    //body.append(passengers_button);

    $("#dropDown").change(function planeObject(){ //Every time user selects a different plane
		$("#videoTitle").remove();
		$("#video").remove();
		$("#reviewsTitle").remove();
		$("#visible-reviews").remove();
		$("#review-form").remove();
	    	$("#planeName").remove();
	    	$("#spaces").remove();
	    	$("#map").remove();
	    	$("#mapAPI").remove();
	    	$("#spacesAfterMap").remove();
	    	$("#destinationsTitle").remove();

            let selection = document.getElementById("dropDown");
            let selectionName = selection.options[selection.selectedIndex].value;
	    body.append("<h1 id='planeName'>"+selectionName+"</h1>");

	    for (const model of models) {
            if (model.name === selectionName) {
		buildDestinationsInterface(model);
                selected_model = model;
                buildReviewInterface(model); //Set up review interface for this plane
                displayVideos(model); //Display Youtube videos for this plane
            }
        }
    });
};

 function buildModelInterface() {
    $('.models-container').toggle();
 };

function emptyInterface() {
	let body = $('body');
	body.empty();
	body.append('<button class="homeBtn" onclick="buildHomeInterface()">Home</button><br>');
};

function buildReviewInterface(model) {
	console.log("reviews method called");
	let body = $('body');
	body.append('<h1 id="reviewsTitle">Reviews</h1>');
	const visible_reviews = $('<div id="visible-reviews">');
	const updateReviews = async () => {
	    visible_reviews.empty();
        const reviews = Reviews.Get(model);
        const fake_reviews = await GetFakePassengerReviews(model);
        for (const review of fake_reviews.concat(reviews)) {
            visible_reviews.append(`<p id="reviews"><em>${review.text}</em> ~ ${review.name}</p>`);
        }
    };

    body.append(visible_reviews);
    updateReviews();
    const review_form = $('<div id="review-form">');
    body.append(review_form);

    review_form.append(`<h2 id="specificReviewTitle">Enter a new review of the ${model.name}</h2>`);
    review_form.append(`<input id="review-name" placeholder="Name"><br><br>`);
    review_form.append('<textarea id="newReview" name="textarea" style="width:250px;height:150px;"></textarea><br>');
    review_form.append('<button id="submitNewReview">Submit Review</button>')

 //   $('<h2>Enter a new review of X model<h2><textarea id="newReview" name="textarea" style="width:250px;height:150px;"></textarea>').appendTo('.revDiv');
 //   $('<button id="submitNewReview" onclick="submitNewReview()">Submit Review</button>').appendTo('.revDiv');

    let submit = document.getElementById("submitNewReview");
    submit.addEventListener("click", function submitNewReview() {
        const name = $('#review-name').val();
        const text = document.getElementById("newReview").value;
        if (name.length === 0 || text.length === 0) {
            return alert('Both name and review must be filled out!');
        }

        Reviews.Add(model, name, text);
        const updatePromise = (model.city === undefined) ? Backend.UpdatePlane(model) : Backend.UpdateAirport(model);
        updatePromise.then(() => {
            updateReviews();
        }).catch(() => {
            alert("There was an error adding your review. Please try resubmitting.");
        });
    }, false);
	body.append('</div>');
};

function buildDestinationsInterface(plane) {
    let body = $('body');
    body.append('<p id="spaces"><br><br><br></p>');
    body.append('<h1 id="destinationsTitle">Destinations</h1>');
    body.append('<div id="map"></div>');
    body.append('<script id="mapAPI" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDZpI3CbtNz2qkNW6N7YzHLqlPxzX6QadM&callback=initMap" async defer></script>');
    body.append('<p id="spacesAfterMap"><br><br></p>');

    Backend.GetAirportDeparturesAndArrivalsForPlane(plane).then((flights) => {
        var i = 0;
        for (const flight of flights) {
            if (i < flights.length) {
            // Can also use flight.departure.latitude and flight.departure.longitude
            const latitude = parseFloat(flight.arrival.latitude);
            const longitude = parseFloat(flight.arrival.longitude);
            addFlag(latitude, longitude);
            i++;
            }
        }
    });
};

function addFlag(latitude, longitude) {
var marker = new google.maps.Marker({
    position: {lat: latitude, lng: longitude},
    map: map,
    title: 'Hello World!'
    });
};

function buildAirportsMapInterface(airport) {
    let body = $('body');
    body.append('<p id="spaces"><br><br><br></p>');
    body.append('<h1 id="destinationsTitle">Map</h1>');
    body.append('<div id="map"></div>');
    body.append('<script id="mapAPI" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDZpI3CbtNz2qkNW6N7YzHLqlPxzX6QadM&callback=initMap" async defer></script>');
    body.append('<p id="spacesAfterMap"><br><br></p>');
    currentAirport = airport;
};

function initMap() {
    var myLatLng = {lat: 39.8283, lng: -98.5795};

    map = new google.maps.Map(document.getElementById('map'), {
         zoom: 3,
         center: myLatLng
       });
if (airports===1) {
  changeMapFocus(currentAirport.latitude, currentAirport.longitude);
}
};

function changeMapFocus(lat, long) {
    map.setCenter(new google.maps.LatLng(lat, long) );
};

async function GetFakePassengerReviews(model) {
    const fake_reviews = [
        `Thank you airport, very cool!!!`,
        `I saw a rat eating a pizza. Will definitely be returning in the near future.`,
        `Okay, I guess, nothing compared to the Hard Rock Cafe though.`,
        `The flight was okay, but the greedy pilot wouldn't let me drive. I just wanted to fly for five minutes, Captain Steve!!!`,
        `Loved the flight attendants, but I sat next to some guy named KMP, and he wouldn't stop asking me to give him a review on rate my professor dot com???`,
        `So what's the deal with airline food anyway?`,
        `Back in my day you had to train a dragon to fly you from city to city, today's kids are so spoiled.`,
        `Turns out, you CAN'T just get up during a flight and break into dance and song. 10/10 for the lovely flight staff, the cabin they put me in was quite spacious :).`,
        `There was a bar. 14/10.`,
        `The only thing I'd change about this place is if they were to allow my emotional support emu.`
    ];

    const passengers = await Backend.GetPassengersThatFlewOnPlane(model);
    return passengers.map((passenger) => {
        return {
            name: `${passenger.first_name} ${passenger.last_name}`,
            text: fake_reviews[Math.floor(Math.random() * fake_reviews.length)],
        };
    });
}

function buildHomeInterface() {
	let body = $('body');

	body.empty();
	body.append('<div class="homeDiv"></div>');
	body.append('<h1 id="pageTitle">Airplane Model Comparison Tool</h1>');
	body.append('<button class="button" onclick="buildModelsInterface()">Models</button>');
	body.append('<button class="button" onclick="buildAirportsInterface()">Airports</button>');
      //$('<h1 id="pageTitle">Airplane Model Comparison Tool</h1>').appendTo('.homeDiv');
      //$('<button class="button" onclick="buildModelsInterface()">Models</button>').appendTo('.homeDiv');
	//$('<button class="button" onclick="buildAirportsInterface()">Airports</button>').appendTo('.homeDiv');

};

async function displayVideos(planeObj) {
	let body = $('body');
	let name = planeObj.name;

    let url = await YouTube.GetTopVideoForPlane(planeObj);
	console.log(planeObj);
   	body.append('<h1 id="videoTitle">Videos of the '+name+'<h1>');
	body.append('<iframe id="video" class="interface" width="420" height="345" src='+url+'></iframe>');
};


async function buildAirportsInterface() {
	let body = $('body');

    emptyInterface();
    const ports = await Backend.GetAirports();
    body.append('<select id="airportDropDown"><option selected="true" disabled="true">Select an airport</option></select>');

    for (const port of ports) {
        let option = document.createElement("option");
        option.text = port.name;
        option.value = port.name;
        document.getElementById("airportDropDown").options.add(option); //Add airport to drop-down menu
    }

    $("#airportDropDown").change(function selectAirport(){ //Every time user selects a different airport
        $("#airportName").remove();
	$("#videoTitle").remove();
	$("#video").remove();
	$("#reviewsTitle").remove();
	$("#visible-reviews").remove();
	$("#review-form").remove();
	$("#spaces").remove();
	$("#map").remove();
	$("#mapAPI").remove();
	$("#spacesAfterMap").remove();
	$("#destinationsTitle").remove();

        let selection = document.getElementById("airportDropDown");
        let selectionName = selection.options[selection.selectedIndex].value;
        body.append("<h1 id='airportName'>"+selectionName+"</h1>");
        for (const port of ports) {
            if (port.name === selectionName) {
                buildReviewInterface(port); //Set up review interface for this plane
                displayVideos(port); //Display Youtube videos for this plane
		buildAirportsMapInterface(port);

            }
        }
    });
};
