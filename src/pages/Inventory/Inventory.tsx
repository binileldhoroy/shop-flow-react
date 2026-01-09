import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { inventoryService } from '../../api/services/inventory.service';
import { StockItem, StockMovement, StockAdjustmentFormData } from '../../types/inventory.types';
import StockAdjustmentModal from '../../components/inventory/StockAdjustmentModal';
import { useAppDispatch } from '@hooks/useRedux';
import { addNotification } from '@store/slices/uiSlice';

const Inventory: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [showMovements, setShowMovements] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stockData, lowStockData, movementsData] = await Promise.all([
        inventoryService.getStock(),
        inventoryService.getLowStockAlerts(),
        inventoryService.getStockMovements(),
      ]);
      setStock(stockData);
      setLowStockItems(lowStockData);
      setMovements(movementsData);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      dispatch(addNotification({ message: 'Failed to load inventory data', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustment = async (data: StockAdjustmentFormData) => {
    try {
      await inventoryService.createStockMovement(data);
      dispatch(addNotification({ message: 'Stock adjusted successfully', type: 'success' }));
      setShowAdjustmentModal(false);
      setSelectedProduct(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adjusting stock:', error);
      dispatch(addNotification({ message: 'Failed to adjust stock', type: 'error' }));
    }
  };

  const handleOpenAdjustmentModal = (product?: StockItem) => {
    if (product) {
      setSelectedProduct(product);
    } else {
      // If no product is provided, select the first product from stock
      if (stock.length > 0) {
        setSelectedProduct(stock[0]);
      }
    }
    setShowAdjustmentModal(true);
  };

  // Calculate statistics
  const stats = {
    totalProducts: stock.length,
    lowStockCount: lowStockItems.length,
    outOfStockCount: stock.filter(item => item.is_out_of_stock).length,
    totalValue: stock.reduce((sum, item) => sum + item.total_value, 0),
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getMovementBadge = (type: string) => {
    const isIncoming = type === 'purchase' || type === 'return';
    return (
      <Badge bg={isIncoming ? 'success' : 'danger'}>
        {isIncoming && <i className="bi bi-arrow-up me-1"></i>}
        {!isIncoming && <i className="bi bi-arrow-down me-1"></i>}
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (item: StockItem) => {
    if (item.is_out_of_stock) {
      return <Badge bg="danger">Out of Stock</Badge>;
    } else if (item.is_low_stock) {
      return <Badge bg="warning" text="dark">Low Stock</Badge>;
    } else {
      return <Badge bg="success">In Stock</Badge>;
    }
  };

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">
                <i className="bi bi-boxes me-2"></i>
                Inventory
              </h1>
              <p className="text-muted">Track stock levels and movements</p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                onClick={() => setShowMovements(!showMovements)}
              >
                {showMovements ? 'Show Stock Levels' : 'Show Movements'}
              </Button>
              <Button
                variant="primary"
                onClick={() => handleOpenAdjustmentModal()}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add Stock Movement
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning" className="d-flex align-items-start">
              <i className="bi bi-exclamation-triangle-fill me-3 fs-5"></i>
              <div className="flex-grow-1">
                <h5 className="alert-heading mb-2">Low Stock Alert</h5>
                <p className="mb-2">
                  {lowStockItems.length} product(s) are running low on stock
                </p>
                <div className="d-flex flex-wrap gap-2">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <Badge key={item.id} bg="warning" text="dark">
                      {item.product_name} ({item.quantity} left)
                    </Badge>
                  ))}
                  {lowStockItems.length > 5 && (
                    <Badge bg="warning" text="dark">
                      +{lowStockItems.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col key="stat-total-products" md={3}>
          <Card>
            <Card.Body>
              <h6 className="text-muted mb-2">Total Products</h6>
              <h3 className="mb-0">{stats.totalProducts}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col key="stat-low-stock" md={3}>
          <Card>
            <Card.Body>
              <h6 className="text-muted mb-2">Low Stock Items</h6>
              <h3 className="mb-0 text-warning">{stats.lowStockCount}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col key="stat-out-of-stock" md={3}>
          <Card>
            <Card.Body>
              <h6 className="text-muted mb-2">Out of Stock</h6>
              <h3 className="mb-0 text-danger">{stats.outOfStockCount}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col key="stat-total-value" md={3}>
          <Card>
            <Card.Body>
              <h6 className="text-muted mb-2">Total Value</h6>
              <h3 className="mb-0">₹{stats.totalValue.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="text-muted mt-3">Loading inventory...</p>
                </div>
              ) : showMovements ? (
                /* Stock Movements View */
                <>
                  <h5 className="mb-4">Stock Movements</h5>
                  {movements.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox fs-1 text-muted"></i>
                      <p className="text-muted mt-3">No stock movements recorded</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Type</th>
                            <th className="text-end">Quantity</th>
                            <th>Reference</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {movements.map((movement) => {
                            const isIncoming = movement.movement_type === 'purchase' || movement.movement_type === 'return';
                            return (
                              <tr key={movement.id}>
                                <td className="text-muted">
                                  {formatDate(movement.created_at)}
                                </td>
                                <td>
                                  <strong>{movement.product_name}</strong>
                                </td>
                                <td>{getMovementBadge(movement.movement_type)}</td>
                                <td className="text-end">
                                  <strong>
                                    {isIncoming ? '+' : '-'}
                                    {movement.quantity}
                                  </strong>
                                </td>
                                <td className="text-muted">
                                  {movement.reference_number || '-'}
                                </td>
                                <td className="text-muted">
                                  {movement.notes || '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </>
              ) : (
                /* Stock Levels View */
                <>
                  <h5 className="mb-4">Stock Levels</h5>
                  {stock.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-box-seam fs-1 text-muted"></i>
                      <p className="text-muted mt-3">No stock records found</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th className="text-end">Current Stock</th>
                            <th className="text-end">Reorder Level</th>
                            <th className="text-center">Status</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stock.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <strong>{item.product_name}</strong>
                                <br />
                                <small className="text-muted">{item.sku}</small>
                              </td>
                              <td className="text-end">
                                <span
                                  className={
                                    item.is_out_of_stock
                                      ? 'text-danger fw-bold'
                                      : item.is_low_stock
                                      ? 'text-warning fw-bold'
                                      : 'fw-bold'
                                  }
                                >
                                  {item.quantity}
                                </span>
                              </td>
                              <td className="text-end text-muted">
                                {item.reorder_level}
                              </td>
                              <td className="text-center">
                                {getStatusBadge(item)}
                              </td>
                              <td className="text-end">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleOpenAdjustmentModal(item)}
                                >
                                  <i className="bi bi-plus-circle me-1"></i>
                                  Adjust
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stock Adjustment Modal */}
      {showAdjustmentModal && selectedProduct && (
        <StockAdjustmentModal
          product={selectedProduct}
          onSave={handleAdjustment}
          onClose={() => {
            setShowAdjustmentModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </Container>
  );
};

export default Inventory;
