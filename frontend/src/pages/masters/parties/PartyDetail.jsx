import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AppIcon from "../../../components/common/AppIcon";
import "../../../styles/item-detail.css";
import { getPartyById, deleteParty } from "../../../services/partyService";

function PartyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteHovered, setDeleteHovered] = useState(false);

  useEffect(() => {
    const fetchPartyDetails = async () => {
      setIsLoading(true);
      try {
        const response = await getPartyById(id);
        const backendParty = response.data;

        const transformedParty = {
          id: backendParty.id,
          name: backendParty.name,
          type:
            backendParty.type === "CUSTOMER"
              ? "Customer"
              : backendParty.type === "SUPPLIER"
              ? "Supplier"
              : "Both",
          gstin: backendParty.gstin,
          phone: backendParty.phone,
          email: backendParty.email,
          addressLine1: backendParty.addressLine1,
          city: backendParty.city,
          state: backendParty.state,
          pincode: backendParty.pincode,
          country: backendParty.country,
          sinceDate: backendParty.sinceDate,
          creditLimit: backendParty.creditLimit,
        };

        setParty(transformedParty);
      } catch (error) {
        console.error("Error fetching party details:", error);
        setParty(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartyDetails();
  }, [id]);

    const handleDeleteParty = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${party.name}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteParty(party.id);
      alert("Party deleted successfully");
      navigate("/app/parties");
    } catch (error) {
      console.error("Error deleting party:", error);
      alert(
        error.response?.data?.message ||
        "Failed to delete party"
      );
    }
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="page-title">Loading party details...</h2>
      </div>
    );
  }

  if (!party) {
    return (
      <div>
        <h2 className="page-title">Party Not Found</h2>
        <button className="btn-primary" onClick={() => navigate("/app/parties")}>
          Back to Parties
        </button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <div>
          <button className="btn-back" onClick={() => navigate("/app/parties")}>
            <AppIcon name="back" /> Back
          </button>
          <h2 className="page-title">{party.name}</h2>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-edit-top" onClick={() => navigate(`/app/parties/edit/${party.id}`)}>
            <AppIcon name="edit" /> Edit
          </button>
          <button className="btn-delete" 
                  onClick={handleDeleteParty}
                  onMouseEnter={() => setDeleteHovered(true)}
                  onMouseLeave={() => setDeleteHovered(false)}
                  style={{
                    backgroundColor: "#f44336",
                    color: "white",
                    transition: "all 0.3s ease",
                    transform: deleteHovered ? "scale(1.05)" : "scale(1)",
                    boxShadow: deleteHovered ? "0 4px 12px rgba(244, 67, 54, 0.4)" : "none",
                  }}
          >
            <AppIcon name="trash" /> Delete
          </button>
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-section">
          <h3 className="section-title">Party Details</h3>
          <div className="detail-grid">
            <div className="detail-row">
              <label>Party Name</label>
              <span>{party.name}</span>
            </div>
            <div className="detail-row">
              <label>Party Type</label>
              <span>
                <span
                  className="type-badge"
                  style={{
                    backgroundColor:
                      party.type === "Customer" ? "#e3f2fd" : "#f3e5f5",
                    color: party.type === "Customer" ? "#1976d2" : "#7b1fa2",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    display: "inline-block",
                  }}
                >
                  {party.type}
                </span>
              </span>
            </div>
            <div className="detail-row">
              <label>GSTIN</label>
              <span>{party.gstin || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3 className="section-title">Contact Details</h3>
          <div className="detail-grid">
            <div className="detail-row">
              <label>Phone</label>
              <span>{party.phone || "N/A"}</span>
            </div>
            <div className="detail-row">
              <label>Email</label>
              <span>{party.email || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3 className="section-title">Address</h3>
          <div className="detail-grid">
            <div className="detail-row">
              <label>Address Line</label>
              <span>{party.addressLine1 || "N/A"}</span>
            </div>
            <div className="detail-row">
              <label>City</label>
              <span>{party.city || "N/A"}</span>
            </div>
            <div className="detail-row">
              <label>State</label>
              <span>{party.state || "N/A"}</span>
            </div>
            <div className="detail-row">
              <label>Pincode</label>
              <span>{party.pincode || "N/A"}</span>
            </div>
            <div className="detail-row">
              <label>Country</label>
              <span>{party.country || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartyDetail;
