import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FieldEditor } from './FieldEditor';
import { FieldDefinition, SubstructureTemplate } from '../../types/structure';

const mockField: FieldDefinition = {
  id: 'field1',
  name: 'Test Field',
  type: 'uint32',
  offset: 0,
  length: 4,
  endianness: 'little',
};

const mockSubstructures: SubstructureTemplate[] = [{ id: 'sub1', name: 'Header', fields: [] }];

const defaultProps = {
  field: mockField,
  isEditing: false,
  hasChanges: false,
  stagedField: mockField,
  availableFields: [],
  substructures: mockSubstructures,
  onStartEdit: vi.fn(),
  onMoveField: vi.fn(),
  onRemoveField: vi.fn(),
  onApplyChanges: vi.fn(),
  onDiscardChanges: vi.fn(),
  onUpdateStaged: vi.fn(),
};

describe('FieldEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders FieldDisplay when not in editing mode and handles clicks', () => {
    render(<FieldEditor {...defaultProps} isEditing={false} />);
    expect(screen.getByText(mockField.name)).toBeInTheDocument();

    fireEvent.click(screen.getByText(mockField.name));
    expect(defaultProps.onStartEdit).toHaveBeenCalled();
  });

  it('calls onUpdateStaged when basic form inputs change', () => {
    render(<FieldEditor {...defaultProps} isEditing={true} />);

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(defaultProps.onUpdateStaged).toHaveBeenCalledWith({ name: 'New Name' });
  });

  it('handles value mapping changes correctly', async () => {
    const fieldWithValueMap: FieldDefinition = {
      ...mockField,
      valueMap: [{ value: '0', description: 'Off' }],
    };

    render(<FieldEditor {...defaultProps} isEditing={true} stagedField={fieldWithValueMap} />);

    // Add
    const button = screen.getByText('Add Mapping');
    fireEvent.click(button);
    expect(defaultProps.onUpdateStaged).toHaveBeenCalledWith({
      valueMap: [...(fieldWithValueMap.valueMap ?? []), { value: '', description: '' }],
    });

    // Update
    const mappingRow = screen.getByDisplayValue('Off').closest('div');
    const valueInput = within(mappingRow!).getByPlaceholderText('Value');
    fireEvent.change(valueInput, { target: { value: '1' } });
    expect(defaultProps.onUpdateStaged).toHaveBeenCalledWith({
      valueMap: [{ value: 1, description: 'Off' }],
    });

    // Remove
    const removeButton = within(mappingRow!).getByRole('button');
    fireEvent.click(removeButton);
    expect(defaultProps.onUpdateStaged).toHaveBeenCalledWith({ valueMap: undefined });
  });

  it('handles bit description changes correctly', () => {
    const fieldWithBitDescriptions: FieldDefinition = {
      ...mockField,
      type: 'uint8',
      bitDescriptions: [{ bitIndex: 0, descriptionIfSet: 'Flag A' }],
    };
    render(
      <FieldEditor {...defaultProps} isEditing={true} stagedField={fieldWithBitDescriptions} />
    );

    // Add
    fireEvent.click(screen.getByText('Add Bit'));
    expect(defaultProps.onUpdateStaged).toHaveBeenCalledWith({
      bitDescriptions: [
        ...(fieldWithBitDescriptions.bitDescriptions ?? []),
        { bitIndex: 0, descriptionIfSet: '' },
      ],
    });

    // Update
    const descriptionRow = screen.getByDisplayValue('Flag A').closest('div');
    const bitIndexInput = within(descriptionRow!).getByLabelText(/Bit/);
    fireEvent.change(bitIndexInput, { target: { value: '1' } });
    expect(defaultProps.onUpdateStaged).toHaveBeenCalledWith({
      bitDescriptions: [{ bitIndex: 1, descriptionIfSet: 'Flag A' }],
    });

    // Remove
    const removeButton = within(descriptionRow!).getByRole('button');
    fireEvent.click(removeButton);
    expect(defaultProps.onUpdateStaged).toHaveBeenCalledWith({ bitDescriptions: undefined });
  });

  it('calls onApplyChanges and onDiscardChanges', () => {
    render(<FieldEditor {...defaultProps} isEditing={true} />);

    fireEvent.click(screen.getByText('Save'));
    expect(defaultProps.onApplyChanges).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Discard'));
    expect(defaultProps.onDiscardChanges).toHaveBeenCalled();
  });
});
