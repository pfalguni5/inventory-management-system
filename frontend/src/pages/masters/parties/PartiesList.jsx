import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../../components/common/AppIcon";
import "../../../styles/global.css";
import { getAllParties, deleteParty} from "../../../services/partyService";

function PartiesList() {
  const navigate = useNavigate();
  const sortDropdownRef = useRef(null);
  const [parties, setParties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPartyId, setHoveredPartyId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [selectedPartyType, setSelectedPartyType] = useState(null);

    useEffect(() => {
    const fetchParties = async () => {
      setIsLoading(true);
      try {
        const response = await getAllParties();

        const transformedParties = response.data.map((party) => ({
          id: party.id,
          name: party.name,
          type:
            party.type === "CUSTOMER"
              ? "Customer"
              : party.type === "SUPPLIER"
              ? "Supplier"
              : "Both",
          gstin: party.gstin,
          phone: party.phone,
          email: party.email,
          addressLine1: party.addressLine1,
          city: party.city,
          state: party.state,
          pincode: party.pincode,
          country: party.country,
          sinceDate: party.sinceDate,
          creditLimit: party.creditLimit,
        }));

        setParties(transformedParties);
      } catch (error) {
        console.error("Error fetching parties:", error);
        alert("Failed to fetch parties");
      } finally {
        setIsLoading(false);
      }
    };

    fetchParties();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sortParties = (partiesToSort) => {
    const sorted = [...partiesToSort];

    sorted.sort((a, b) => {
      let compareValue = 0;

      if (sortBy === "name") {
        compareValue = a.name.localeCompare(b.name);
      }

      return sortDir === "asc" ? compareValue : -compareValue;
    });

    return sorted;
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortDir("asc");
    }
  };

  const filteredParties = parties.filter((party) => {
    const matchesSearch = party.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedPartyType ? party.type === selectedPartyType : true;
    return matchesSearch && matchesType;
  });

  const sortedAndFilteredParties = sortParties(filteredParties);


  const handleRowClick = (id) => {
    navigate(`/app/parties/${id}`);
  };

    const handleDeleteParty = async (partyId, partyName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${partyName}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteParty(partyId);

      setParties((prevParties) =>
        prevParties.filter((party) => party.id !== partyId)
      );

      alert("Party deleted successfully");
    } catch (error) {
      console.error("Error deleting party:", error);
      alert(
        error.response?.data?.message ||
        "Failed to delete party"
      );
    }
  };

  return (
    <div>
      <h2 className="page-title">Parties</h2>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", marginBottom: "20px", gap: "12px" }}>
        <button className="btn-new" onClick={() => navigate("/app/parties/new")}>
          + Add New Party
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search parties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <AppIcon name="search" className="search-icon" />
          </div>

          {/* Sort Dropdown */}
          <div className="sort-dropdown-wrapper" ref={sortDropdownRef}>
            <button
              className="sort-toggle-btn"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              title="Sort parties"
            >
              <AppIcon name="filter" size="lg" />
              <span className="sort-label">{sortDir === "asc" ? "↑" : "↓"}</span>
            </button>

            {sortDropdownOpen && (
              <div className="sort-dropdown-menu">
                <div className="sort-header">Sort By Name</div>
                {[
                  { id: "name", label: "Party Name (A to Z)" },
                  { id: "name-desc", label: "Party Name (Z to A)" },
                ].map((option) => (
                  <button
                    key={option.id}
                    className={`sort-option ${
                      (option.id === "name" && sortBy === "name" && sortDir === "asc") ||
                      (option.id === "name-desc" && sortBy === "name" && sortDir === "desc")
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      if (option.id === "name-desc") {
                        setSortBy("name");
                        setSortDir("desc");
                      } else {
                        handleSortChange(option.id);
                      }
                      setSortDropdownOpen(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {((option.id === "name" && sortBy === "name" && sortDir === "asc") ||
                      (option.id === "name-desc" && sortBy === "name" && sortDir === "desc")) && (
                      <span className="sort-direction">
                        {option.id === "name-desc" ? "↓" : "↑"}
                      </span>
                    )}
                  </button>
                ))}
                
                <div className="sort-header" style={{ marginTop: "8px" }}>Filter By Type</div>
                {[
                  { id: "all", label: "All Types" },
                  { id: "Customer", label: "Customer" },
                  { id: "Supplier", label: "Supplier" },
                  { id: "Both", label: "Both" },
                ].map((option) => (
                  <button
                    key={option.id}
                    className={`sort-option ${
                      (option.id === "all" && selectedPartyType === null) ||
                      (option.id !== "all" && selectedPartyType === option.id)
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedPartyType(option.id === "all" ? null : option.id);
                      setSortDropdownOpen(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {((option.id === "all" && selectedPartyType === null) ||
                      (option.id !== "all" && selectedPartyType === option.id)) && (
                      <AppIcon name="check" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Party Name</th>
              <th>Type</th>
              <th>City</th>
              <th>Pincode</th>
              <th style={{ width: "60px", textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="no-data">Loading parties...</td>
              </tr>
            ) : sortedAndFilteredParties.length > 0 ? (
              sortedAndFilteredParties.map((party) => (
                <tr 
                  key={party.id}
                  onClick={() => handleRowClick(party.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{party.name}</td>
                  <td>
                    <span
                      className="type-badge"
                      style={{
                        backgroundColor:
                          party.type === "Customer"
                            ? "#e3f2fd"
                            : party.type === "Supplier"
                            ? "#f3e5f5"
                            : "#e8f5e9",
                        color:
                          party.type === "Customer"
                            ? "#1976d2"
                            : party.type === "Supplier"
                            ? "#7b1fa2"
                            : "#2e7d32",
                      }}
                    >
                      {party.type}
                    </span>
                  </td>
                  <td>{party.city || "-"}</td>
                  <td>{party.pincode || "-"}</td>
                  <td className="center" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-delete-icon"
                     onClick={() => handleDeleteParty(party.id, party.name)}
                      onMouseEnter={() => setHoveredPartyId(party.id)}
                      onMouseLeave={() => setHoveredPartyId(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f44336",
                        cursor: "pointer",
                        fontSize: "18px",
                        padding: "4px 8px",
                        transition: "all 0.3s ease",
                        transform: hoveredPartyId === party.id ? "scale(1.2)" : "scale(1)",
                        opacity: hoveredPartyId === party.id ? "1" : "0.7",
                      }}
                      title="Delete party"
                    >
                      <AppIcon name="trash" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">No parties found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PartiesList;
