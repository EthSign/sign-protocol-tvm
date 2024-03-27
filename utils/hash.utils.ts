import { Address, beginCell } from '@ton/core';
import { AttestationConfig, SchemaConfig, attestationConfigToCell, schemaConfigToCell } from '../wrappers';
import { Actions } from './constants';
import { arraysToCell, stringToSlice } from './ton.utils';

export function getRegisterHashCell(schema: SchemaConfig) {
  const schemaCell = schemaConfigToCell(schema);
  const dataCell = beginCell().storeUint(Actions.Register, 32).storeRef(schemaCell).endCell();

  return dataCell;
}

export function getRegisterBatchHashCell(schemas: SchemaConfig[]) {
  const schemasCell = arraysToCell(schemas.map(schemaConfigToCell));
  const dataCell = beginCell().storeUint(Actions.RegisterBatch, 32).storeRef(schemasCell).endCell();

  return dataCell;
}

export function getAttestHashCell(attestation: AttestationConfig) {
  const attestationCell = attestationConfigToCell(attestation);
  const dataCell = beginCell().storeUint(Actions.Attest, 32).storeRef(attestationCell).endCell();

  return dataCell;
}

export function getAttestBatchHashCell(attestations: AttestationConfig[]) {
  const attestationsCell = arraysToCell(attestations.map(attestationConfigToCell));
  const dataCell = beginCell().storeUint(Actions.AttestBatch, 32).storeRef(attestationsCell).endCell();

  return dataCell;
}

export function getAttestOffchainHashCell(attestationOffchainAddress: Address) {
  const dataCell = beginCell().storeUint(Actions.AttestOffchain, 32).storeAddress(attestationOffchainAddress).endCell();

  return dataCell;
}

export function getAttestOffchainBatchHashCell(attestationOffchainAddresses: Address[]) {
  const attestationOffchainAddressesCell = arraysToCell(attestationOffchainAddresses);
  const dataCell = beginCell()
    .storeUint(Actions.AttestOffchainBatch, 32)
    .storeRef(attestationOffchainAddressesCell)
    .endCell();

  return dataCell;
}

export function getRevokeHashCell(attestationAddress: Address, reason: string) {
  const attestationIdAndReasonCell = beginCell()
    .storeAddress(attestationAddress)
    .storeSlice(stringToSlice(reason))
    .endCell();
  const dataCell = beginCell().storeUint(Actions.Revoke, 32).storeRef(attestationIdAndReasonCell).endCell();

  return dataCell;
}

export function getRevokeBatchHashCell(attestationAddresses: Address[], reasons: string[]) {
  const attestationIdsCell = arraysToCell(attestationAddresses);
  const reasonsCell = arraysToCell(reasons.map(stringToSlice));
  const attestationIdsAndReasonsCell = beginCell().storeRef(attestationIdsCell).storeRef(reasonsCell).endCell();
  const dataCell = beginCell().storeUint(Actions.RevokeBatch, 32).storeRef(attestationIdsAndReasonsCell).endCell();

  return dataCell;
}

export function getRevokeOffchainHashCell(attestationOffchainAddress: Address, reason: string) {
  const attestationOffchainIdAndReasonCell = beginCell()
    .storeAddress(attestationOffchainAddress)
    .storeSlice(stringToSlice(reason))
    .endCell();
  const dataCell = beginCell()
    .storeUint(Actions.RevokeOffchain, 32)
    .storeRef(attestationOffchainIdAndReasonCell)
    .endCell();

  return dataCell;
}

export function getRevokeOffchainBatchHashCell(attestationOffchainAddresses: Address[], reasons: string[]) {
  const attestationOffchainIdsCell = arraysToCell(attestationOffchainAddresses);
  const reasonsCell = arraysToCell(reasons.map(stringToSlice));
  const attestationOffchainIdsAndReasonsCell = beginCell()
    .storeRef(attestationOffchainIdsCell)
    .storeRef(reasonsCell)
    .endCell();
  const dataCell = beginCell()
    .storeUint(Actions.RevokeOffchainBatch, 32)
    .storeRef(attestationOffchainIdsAndReasonsCell)
    .endCell();

  return dataCell;
}
