import React, { useEffect, useState } from "react";
import {
  Layout,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  message,
  Popconfirm,
  Card,
  Space,
  Typography,
  Tag,
  theme,
  Table,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  createGame,
  deleteGame,
  getAllGames,
  updateGame,
} from "../../../apis/api";
import AdminNavbar from "../../../components/AdminNavbar";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Content } = Layout;

const CreatGame = () => {
  const [games, setGames] = useState([]);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameImage, setGameImage] = useState(null);
  const [searchText, setSearchText] = useState("");

  const { token } = theme.useToken();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await getAllGames();
      setGames(res.data.games);
    } catch (error) {
      message.error("Failed to fetch games");
      console.error(error);
    }
    setLoading(false);
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      if (gameImage) {
        formData.append("gameImage", gameImage);
      }

      if (editingGame) {
        await updateGame(editingGame._id, formData);
        message.success("Game updated successfully");
      } else {
        await createGame(formData);
        message.success("Game added successfully");
      }

      setIsModalOpen(false);
      form.resetFields();
      setGameImage(null);
      fetchGames();
    } catch (error) {
      message.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGame(id);
      message.success("Game deleted successfully");
      fetchGames();
    } catch (error) {
      message.error("Failed to delete game");
    }
  };

  const columns = [
    {
      title: "Game Image",
      dataIndex: "gameImage",
      key: "gameImage",
      width: 100,
      render: (image, record) => (
        <img
          src={`http://localhost:5000/game/${record.gameImage}`}
          alt={record.gameName}
          style={{
            width: 60,
            height: 60,
            objectFit: "cover",
            borderRadius: "8px",
            border: `1px solid ${token.colorBorder}`,
          }}
        />
      ),
    },
    {
      title: "Game Details",
      dataIndex: "gameName",
      key: "gameDetails",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.gameName}</Text>
          <Tag color={token.colorPrimary}>{record.gameType}</Tag>
          <Text type="secondary" style={{ fontSize: "0.9em" }}>
            {record.gameDescription}
          </Text>
        </Space>
      ),
    },
    {
      title: "Price",
      dataIndex: "gamePrice",
      key: "gamePrice",
      width: 120,
      render: (price) => (
        <Text strong style={{ color: token.colorSuccess }}>
          ${price.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => (
        <Text type="secondary">{new Date(date).toLocaleDateString()}</Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingGame(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          />
          <Popconfirm
            title="Delete this game?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredGames = games.filter(
    (game) =>
      game.gameName.toLowerCase().includes(searchText.toLowerCase()) ||
      game.gameType.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminNavbar />
      <Layout>
        <Content
          style={{ padding: "24px", background: token.colorBgContainer }}
        >
          <Card bordered={false}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Title level={2} style={{ margin: 0 }}>
                  Game Management
                </Title>
                <Space>
                  <Input
                    placeholder="Search games..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 200 }}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingGame(null);
                      form.resetFields();
                      setIsModalOpen(true);
                    }}
                  >
                    Add Game
                  </Button>
                </Space>
              </div>

              <Table
                columns={columns}
                dataSource={filteredGames}
                loading={loading}
                rowKey="_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} games`,
                }}
              />
            </Space>
          </Card>

          <Modal
            title={
              <Title level={4} style={{ margin: 0 }}>
                {editingGame ? "Edit Game" : "Add New Game"}
              </Title>
            }
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setGameImage(null);
            }}
            footer={null}
            width={600}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              style={{ marginTop: "24px" }}
            >
              <Form.Item
                name="gameName"
                label="Game Name"
                rules={[{ required: true, message: "Please input game name!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="gameType"
                label="Game Type"
                rules={[{ required: true, message: "Please input game type!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="gameDescription"
                label="Description"
                rules={[
                  { required: true, message: "Please input game description!" },
                ]}
              >
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item
                name="gamePrice"
                label="Price"
                rules={[{ required: true, message: "Please input price!" }]}
              >
                <InputNumber
                  prefix="$"
                  min={0}
                  step={0.01}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                name="gameImage"
                label="Game Image"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) return e;
                  return e?.fileList;
                }}
              >
                <Upload
                  beforeUpload={(file) => {
                    setGameImage(file);
                    return false;
                  }}
                  maxCount={1}
                  listType="picture-card"
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                <Space>
                  <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="primary" htmlType="submit">
                    {editingGame ? "Update" : "Add"} Game
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CreatGame;
