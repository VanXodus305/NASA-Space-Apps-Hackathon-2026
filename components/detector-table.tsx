'use client'
import { Table } from '@heroui/react'
import { detectors } from '@/lib/spherex'

export function DetectorTable() {
  return (
    <Table className="overflow-hidden rounded-xl border border-white/10 bg-panel">
      <Table.ScrollContainer>
        <Table.Content
          aria-label="SPHEREx detector wavelength ranges and spectral resolving powers"
          className="w-full"
        >
          <Table.Header>
            <Table.Column
              isRowHeader
              className="bg-panel-2 px-4 py-4 text-[11px] text-lilac"
            >
              DETECTOR
            </Table.Column>
            <Table.Column className="bg-panel-2 px-4 py-4 text-[11px] text-lilac">
              WAVELENGTH (μm)
            </Table.Column>
            <Table.Column className="bg-panel-2 px-4 py-4 text-[11px] text-lilac">
              RESOLVING POWER
            </Table.Column>
          </Table.Header>
          <Table.Body>
            {detectors.map((d, i) => (
              <Table.Row
                key={d.id}
                id={d.id}
                className="border-t border-white/8 transition-colors hover:bg-[#b99ccc]/8"
              >
                <Table.Cell className="px-4 py-4 font-mono text-xs text-ink">
                  <span
                    className={`mr-3 inline-block h-2 w-2 rounded-full ${['bg-[#e4c4eb]', 'bg-[#c8abdf]', 'bg-[#ac9ad3]', 'bg-[#8a88bf]', 'bg-[#7375aa]', 'bg-[#575d91]'][i]}`}
                  />
                  {d.id}
                </Table.Cell>
                <Table.Cell className="px-4 py-4 font-mono text-xs text-ink-dim">
                  {d.range}
                </Table.Cell>
                <Table.Cell className="px-4 py-4 font-mono text-xs text-ink-dim">
                  R = {d.resolving}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
