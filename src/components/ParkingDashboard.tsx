 import React, { useState ,useEffect} from "react";
import { Car, LogOut, ArrowLeft, MapPin, Clock, Star, List } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
interface Order {
  id: string;
  lot_id: string;
  user_id: string;
  from: string;
  to: string;
}


type Place = {
  _id: string;
  name: string;
  totalLots: number;
  latitude: number;
  longitude: number;
  price: number;
  address: string;
  image: string;
  features: string[];
  secretKey: string;
  rating: number;
};

interface User {
  id: string;
  name: string;
  email: string;
}

interface ParkingDashboardProps {
  user: User;
  onLogout: () => void;
}

const createPinIcon = (color: string, label: string) =>
  new L.DivIcon({
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 24 24" fill="${color}">
          <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z"/>
        </svg>
        <span style="position: absolute; top: 8px; font-size: 12px; font-weight: bold; color: white;">
          ${label}
        </span>
      </div>`,
    className: "",
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
  });

const ParkingDashboard: React.FC<ParkingDashboardProps> = ({ user, onLogout }) => {
  const [view, setView] = useState<"list" | "map">("list");
const [search, setSearch] = useState<string>("");
const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
const [selectedFrom, setSelectedFrom] = useState<string>("");
const [selectedTo, setSelectedTo] = useState<string>("");
const [places, setPlaces] = useState<Place[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [amount, setAmount] = useState<number>(0);
const [reviews, setReviews] = useState<{ user_name: string; comment: string; rating: number }[]>([]);
 
useEffect(() => {
  if (!selectedPlace?._id) return;

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews?lot_id=${selectedPlace._id}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchReviews();
}, [selectedPlace]);
useEffect(() => {
  if (selectedFrom && selectedTo) {
    const from = new Date(selectedFrom);
    const to = new Date(selectedTo);
    const hours = Math.max(0, (to.getTime() - from.getTime()) / (1000 * 60 * 60));
    setAmount(hours * 10);
  }
}, [selectedFrom, selectedTo]);
useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");

    if (payment === "success") {
      alert("Booking confirmed!");
      window.history.replaceState({}, document.title, "/"); // remove query param
    } else if (payment === "cancel") {
      alert("Booking failed or cancelled!");
      window.history.replaceState({}, document.title, "/");
    }
  }, []);
 useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/tasks");
        if (!res.ok) throw new Error("Failed to fetch places");
        const data = await res.json();
        setPlaces(data); // assuming API returns array of Place objects
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);
  
const [orders, setOrders] = useState<Order[]>([]); // replace hardcoded array

useEffect(() => {
  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/payment/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchOrders();
}, []);

  const filteredPlaces = places.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  
// Frontend
const makePayment = async () => {
  if (!selectedPlace) return;
 console.log(selectedPlace._id);
  const response = await fetch("http://localhost:5000/api/payment/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lot_id: selectedPlace._id,
      user_name: user.name,
      from: selectedFrom,
      to: selectedTo,
      secretKey: selectedPlace.secretKey, // send secret key for backend
      amount: amount,
    }),
  });

  const data = await response.json();

  // Redirect directly to Stripe Checkout
  window.location.href = data.url;
};


const calculateAvailable = (placeId: string, from: string, to: string) => {
  const fromTime = new Date(from);
  const toTime = new Date(to);

  const place = places.find((p) => p._id === placeId);
  if (!place) return 0;

  let maxOverlap = 0;

  for (let t = new Date(fromTime); t < toTime; t.setHours(t.getHours() + 1)) {
    const nextHour = new Date(t);
    nextHour.setHours(t.getHours() + 1);

    const overlapCount = orders.filter(
      (o) =>
        o.lot_id === placeId &&
        new Date(o.from) < nextHour &&
        new Date(o.to) > t
    ).length;

    if (overlapCount > maxOverlap) maxOverlap = overlapCount;
  }

  return place.totalLots - maxOverlap;
};
if (loading) {
    return <div className="p-6 text-center">Loading places...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center">
            <Car className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">ParkEase</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <p className="font-medium text-gray-900">Welcome, {user.name}</p>
              <p className="text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-2 text-sm rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 inline mr-1" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Details Page */}
        {selectedPlace ? (
          <div className="bg-white shadow-md rounded-lg border p-6">
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedPlace(null);
                setSelectedFrom("");
                setSelectedTo("");
              }}
              className="mb-4 flex items-center text-blue-600 hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>

            {/* Place Image */}
            <img
              src={selectedPlace.image}
              alt={selectedPlace.name}
              className="w-full h-64 object-contain rounded-lg"
            />

            {/* Overview */}
            <h2 className="text-2xl font-bold mt-4">{selectedPlace.name}</h2>
            <p className="text-gray-500">{selectedPlace.address}</p>

            {/* Rating */}
            <div className="flex items-center mt-2">
              <Star className="w-5 h-5 text-yellow-500 mr-1" />
              <span className="font-medium">{selectedPlace.rating} / 5</span>
            </div>

            {/* Features */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold flex items-center">
                <List className="w-5 h-5 mr-2" /> Features
              </h3>
              <ul className="list-disc ml-6 text-gray-700">
                {selectedPlace.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
            


           {/* Availability */}
{/* Availability Section */}
<div className="mt-6">

  {/* Header */}
  <h3 className="text-lg font-semibold flex items-center mb-4">
    <Clock className="w-5 h-5 mr-2" /> Select Date & Time
  </h3>

  {/* From Date & Hour Selection */}
  <div className="mb-4 flex gap-4">
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-500 mb-1">From Date</label>
      <input
  type="date"
  value={selectedFrom.split("T")[0]}
  onChange={(e) => {
    const hour = selectedFrom ? new Date(selectedFrom).getHours() : 12;
    const newFrom = new Date(`${e.target.value}T${hour}:00:00`);
    setSelectedFrom(newFrom.toISOString());

    // Auto-adjust selectedTo
    const toTime = selectedTo ? new Date(selectedTo) : null;
    if (!toTime || toTime <= newFrom) {
      const newTo = new Date(newFrom);
      newTo.setHours(newTo.getHours() + 1);
      setSelectedTo(newTo.toISOString());
    }
  }}
/>
    </div>
    {/* From Hour */}
<div className="flex-1">
  <label className="block text-sm font-medium text-gray-500 mb-1">From Hour</label>
  <select
    value={selectedFrom ? new Date(selectedFrom).getHours() : 12}
    onChange={(e) => {
      const hour = parseInt(e.target.value, 10);
      const datePart = selectedFrom
        ? selectedFrom.split("T")[0]
        : new Date().toISOString().split("T")[0];

      const newFrom = new Date(`${datePart}T${hour}:00:00`);
      setSelectedFrom(newFrom.toISOString());

      // ensure To is after From
      const fromTime = newFrom;
      const toTime = selectedTo ? new Date(selectedTo) : null;
      if (!toTime || toTime <= fromTime) {
        const newTo = new Date(fromTime);
        newTo.setHours(newTo.getHours() + 1);
        setSelectedTo(newTo.toISOString());
      }
    }}
    className="w-full border rounded-md px-2 py-1 text-sm hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
  >
    {Array.from({ length: 24 }, (_, h) => (
      <option key={h} value={h}>
        {h.toString().padStart(2, "0")}:00
      </option>
    ))}
  </select>
</div>

  </div>

  {/* From Slots Row */}
  <div className="mb-3">
    <p className="text-sm font-medium text-gray-500 mb-1">From Slots</p>
    <div className="flex gap-2 overflow-x-auto pb-2">
      {(() => {
        const now = new Date();
        const totalDays = 30;
        const hours = [];
        for (let d = 0; d < totalDays; d++) {
          for (let h = 0; h < 24; h++) {
            const time = new Date();
            time.setDate(now.getDate() + d);
            time.setHours(h, 0, 0, 0);
            if (time > now) hours.push(time);
          }
        }
        return hours.map((fs, i) => (
          <button
            key={i}
            className={`flex-shrink-0 border rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedFrom.slice(0,13) === fs.toISOString().slice(0,13) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
            }`}
            onClick={() => setSelectedFrom(fs.toISOString())}
          >
            <div>{fs.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} </div> {fs.getHours()}:00
          </button>
        ));
      })()}
    </div>
  </div>

  {/* To Date & Hour Selection */}
  {selectedFrom && (
    <div className="mb-4 flex gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-500 mb-1">To Date</label>
        <input
  type="date"
  value={selectedTo.split("T")[0]}
  onChange={(e) => {
    const hour = selectedTo ? new Date(selectedTo).getHours() : new Date(selectedFrom).getHours() + 1;
    const newTo = new Date(`${e.target.value}T${hour}:00:00`);
    const fromTime = selectedFrom ? new Date(selectedFrom) : new Date();
    if (newTo <= fromTime) {
      newTo.setHours(fromTime.getHours() + 1);
    }
    setSelectedTo(newTo.toISOString());
  }}
/>
      </div>

{/* To Hour */}
<div className="flex-1">
  <label className="block text-sm font-medium text-gray-500 mb-1">To Hour</label>
  <select
    value={selectedTo ? new Date(selectedTo).getHours() : (selectedFrom ? new Date(selectedFrom).getHours() + 1 : 13)}
    onChange={(e) => {
      const hour = parseInt(e.target.value, 10);
      const datePart = selectedTo
        ? selectedTo.split("T")[0]
        : selectedFrom
        ? selectedFrom.split("T")[0]
        : new Date().toISOString().split("T")[0];

      let newTo = new Date(`${datePart}T${hour}:00:00`);
      const fromTime = selectedFrom ? new Date(selectedFrom) : new Date();
      if (newTo <= fromTime) newTo.setHours(fromTime.getHours() + 1);
      setSelectedTo(newTo.toISOString());
    }}
    className="w-full border rounded-md px-2 py-1 text-sm hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
  >
    {Array.from({ length: 24 }, (_, h) => (
      <option key={h} value={h}>
        {h.toString().padStart(2, "0")}:00
      </option>
    ))}
  </select>
</div>  
    </div>
  )}

  {/* To Slots Row */}
  {selectedFrom && (
    <div className="mb-3">
      <p className="text-sm font-medium text-gray-500 mb-1">To Slots</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(() => {
          const fromTime = new Date(selectedFrom);
          const totalDays = 30;
          const hours = [];
          for (let d = 0; d < totalDays; d++) {
            for (let h = 0; h < 24; h++) {
              const time = new Date(fromTime);
              time.setDate(fromTime.getDate() + d);
              time.setHours(h, 0, 0, 0);
              if (time > fromTime) hours.push(time);
            }
          }
          return hours.map((ts, j) => (
            <button
              key={j}
              className={`flex-shrink-0 border rounded-lg px-4 py-2 text-sm font-medium transition ${
                selectedTo.slice(0,13) === ts.toISOString().slice(0,13) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
              }`}
              onClick={() => setSelectedTo(ts.toISOString())}
            >
              <div>{ts.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} </div> {ts.getHours()}:00
            </button>
          ));
        })()}
      </div>
    </div>
  )}
</div>

{/* Availability & Price Section */}
{selectedFrom && selectedTo && (
  <div className="mt-6 border-t pt-4">
    <div className="flex justify-between items-center mb-3">
      <p className="text-sm font-medium text-gray-500">Available</p>
<p className="text-base font-semibold text-gray-800">
  {calculateAvailable(selectedPlace._id, selectedFrom, selectedTo)}
</p>
    </div>

    {selectedFrom && selectedTo && (() => {
  const from = new Date(selectedFrom);
  const to = new Date(selectedTo);
  const hours = Math.max(0, (to.getTime() - from.getTime()) / (1000 * 60 * 60));
  const pricePerHour = 10;
  const totalPrice = hours * pricePerHour;
  return (
    <div className="flex justify-between items-center mb-4">
      <p className="text-sm font-medium text-gray-500">Total Price</p>
      <p className="text-lg font-semibold text-gray-800">${totalPrice.toFixed(2)}</p>
    </div>
  );
})()}


    <button
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
      onClick= {makePayment}
    >
      Book Now
    </button>
  </div>
)}


            {/* Location */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="w-5 h-5 mr-2" /> Location
              </h3>
              <div className="h-60 w-full rounded-lg overflow-hidden mt-2">
                <MapContainer
                  center={[selectedPlace.latitude, selectedPlace.longitude]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[selectedPlace.latitude, selectedPlace.longitude]}
                    icon={createPinIcon("blue", "P")}
                  >
                    <Popup>{selectedPlace.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

          {/* Reviews */}
<div className="mt-6">
  <h3 className="text-lg font-semibold flex items-center">
    <Star className="w-5 h-5 mr-2" /> Reviews
  </h3>

  <div className="mt-2 space-y-3">
    {reviews.map((r, i) => (
      <div key={i} className="border p-3 rounded-lg">
        <p className="font-semibold">{r.user_name}</p>
        <p className="text-gray-600">{r.comment}</p>
        <p className="text-sm text-yellow-600">Rating: {r.rating}/5</p>
      </div>
    ))}
  </div>

  <div className="mt-4 border-t pt-4">
    <h4 className="text-md font-semibold mb-2">Add a Review</h4>
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const comment = (form.elements.namedItem("comment") as HTMLInputElement).value;
        const rating = parseInt((form.elements.namedItem("rating") as HTMLSelectElement).value);

        try {
          await fetch("http://localhost:5000/api/reviews/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_name: user.name,
              comment,
              rating,
              lot_id: selectedPlace._id,
            }),
          });

          // Refetch reviews after POST
          const res = await fetch(`http://localhost:5000/api/reviews?lot_id=${selectedPlace._id}`);
          const updatedReviews = await res.json();
          setReviews(updatedReviews);

          form.reset();
        } catch (err) {
          console.error(err);
        }
      }}
      className="space-y-3"
    >
      <textarea
        name="comment"
        placeholder="Your comment"
        required
        className="w-full border px-3 py-2 rounded-md"
      />
      <select
        name="rating"
        required
        className="w-full border px-3 py-2 rounded-md"
      >
        <option value="">Select rating</option>
        {[1, 2, 3, 4, 5].map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Submit Review
      </button>
    </form>
  </div>
</div>

          </div>
        ) : (
          <>
            {/* Search & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <input
                type="text"
                placeholder="Search by name"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-72"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setView("list")}
                  className={`px-4 py-2 rounded-md border ${
                    view === "list" ? "bg-blue-600 text-white" : "bg-white"
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => setView("map")}
                  className={`px-4 py-2 rounded-md border ${
                    view === "map" ? "bg-blue-600 text-white" : "bg-white"
                  }`}
                >
                  Map View
                </button>
              </div>
            </div>

            {/* List View */}
            {view === "list" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPlaces.map((place) => (
                  <div
                    key={place._id}
                    className="bg-white rounded-lg shadow-md border overflow-hidden"
                  >
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-48 object-contain"
                    />
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-gray-900">{place.name}</h2>
                      <p className="text-sm text-gray-500">{place.address}</p>
                      <p className="text-sm text-gray-500">{place.totalLots} total slots</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-green-600 font-bold">${place.price} / hr</span>
                        <button
                          onClick={() => setSelectedPlace(place)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Map View */}
            {view === "map" && (
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden h-[500px]">
                <MapContainer
                  center={[20.5937, 78.9629]}
                  zoom={5}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {filteredPlaces.map((place) => (
                    <Marker
                      key={place._id}
                      position={[place.latitude, place.longitude]}
                      icon={createPinIcon("green", "P")}
                    >
                      <Popup>
                        <strong>{place.name}</strong>
                        <br />
                        {place.totalLots} total slots
                        <br />
                        <button
                          onClick={() => setSelectedPlace(place)}
                          className="mt-2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                        >
                          View Details
                        </button>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParkingDashboard;


