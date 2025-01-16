import React, { useEffect, useState } from "react";
import { Layout, Row, Col, Card, Button, Spin, message } from "antd";
import { getAllGames, initializeKhaltiPayment } from "../../apis/api";

const { Content } = Layout;

const PlayGame = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const handlePayment = async (game) => {
    try {
      const { _id, gamePrice } = game;
      const totalPriceInPaisa = gamePrice * 100;

      const response = await initializeKhaltiPayment({
        itemId: _id,
        totalPrice: totalPriceInPaisa,
        website_url: window.location.origin,
      });

      if (response.data.success) {
        // Redirect to the Khalti payment URL
        window.location.href = response.data.payment_url;
      } else {
        message.error("Failed to initialize payment");
      }
    } catch (error) {
      console.error("Error initiating Khalti payment:", error);
      message.error("Error initiating Khalti payment");
    }
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await getAllGames();
        if (response.data.success) {
          setGames(response.data.games);
        } else {
          message.error("Failed to fetch games");
        }
      } catch (error) {
        console.error("Error fetching games:", error);
        message.error("An error occurred while fetching games.");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <Layout>
      <Content
        style={{
          padding: "40px",
          maxWidth: "1200px",
          margin: "70px auto 0",
          minHeight: "calc(100vh - 70px)",
          background: "#f5f5f5",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <div>
            <h1
              style={{
                textAlign: "center",
                marginBottom: "40px",
                fontSize: "2.5rem",
                color: "#1B4277",
              }}
            >
              Releasing soon
            </h1>
            <Row
              gutter={[32, 32]}
              justify="center"
              style={{ maxWidth: "1000px", margin: "0 auto" }}
            >
              {games.map((game) => (
                <Col xs={24} sm={24} md={12} key={game._id}>
                  <Card
                    hoverable
                    className="game-card"
                    style={{
                      height: "100%",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    cover={
                      <div
                        style={{
                          position: "relative",
                          height: "250px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={`http://localhost:5000/game/${game.gameImage}`}
                          alt={game.gameName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.3s ease",
                          }}
                        />
                      </div>
                    }
                  >
                    <Card.Meta
                      title={
                        <div
                          style={{
                            fontSize: "1.5rem",
                            color: "#1B4277",
                            marginBottom: "15px",
                          }}
                        >
                          {game.gameName}
                        </div>
                      }
                    />
                    <Button
                      type="primary"
                      style={{
                        marginTop: "15px",
                        width: "100%",
                        height: "45px",
                        fontSize: "16px",
                        backgroundColor: "#1B4277",
                        borderColor: "#1B4277",
                        borderRadius: "6px",
                        transition: "all 0.3s ease",
                      }}
                      onClick={() => handlePayment(game)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#2B5287";
                        e.currentTarget.style.borderColor = "#2B5287";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#1B4277";
                        e.currentTarget.style.borderColor = "#1B4277";
                      }}
                    >
                      Early Booking
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default PlayGame;
