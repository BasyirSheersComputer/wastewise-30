import React, { useState } from 'react';
import { sendInventoryUpdate } from '../services/inventorySocket';

type AddInventoryModalProps = {
  open: boolean;
  onClose: () => void;
};

const AddInventoryModal: React.FC<AddInventoryModalProps> = ({ open, onClose }) => {
  const [form, setForm] = useState({ name: '', batch: '', quantity: '', expiry: '', received: '' });

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Add Inventory Item</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            sendInventoryUpdate({ type: 'log', ...form, quantity: Number(form.quantity) });
            onClose();
          }}
        >
          {/* Form fields for name, batch, quantity, expiry, received */}
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Batch"
            value={form.batch}
            onChange={e => setForm({ ...form, batch: e.target.value })}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={e => setForm({ ...form, quantity: e.target.value })}
          />
          <input
            type="date"
            placeholder="Expiry"
            value={form.expiry}
            onChange={e => setForm({ ...form, expiry: e.target.value })}
          />
          <input
            type="date"
            placeholder="Received"
            value={form.received}
            onChange={e => setForm({ ...form, received: e.target.value })}
          />
          <button type="submit" className="glass-button">Add</button>
          <button type="button" className="glass-button-secondary" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryModal;
