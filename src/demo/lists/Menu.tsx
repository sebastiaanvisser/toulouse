import React, { ReactNode } from 'react'
import { Box, BoxProps } from '../../box/Box'
import { Small } from '../../box/Small'
import { Theme } from '../../box/Themed'
import { Unit } from '../../box/Unit'
import { Icons } from '../../icon/Icons'
import * as S from '../../icon/Shape'
import { Use, Var } from '../../lib/Var'
import { Blue, Color, Hovering, Primary, White, Yellow } from '../../styling/Color'
import { Arctic, Lava } from '../../styling/Palette'
import { Icon } from '../../widget/Icon'
import { Label } from '../../widget/Label'
import { Listbox } from '../../widget/Listbox'
import { Panel } from '../../widget/Panel'
import { Tag } from '../../widget/Tag'
import { randomLorem } from '../Lorem'

interface MenuItem {
  key: string
  label: React.ReactNode
  unread?: React.ReactNode
  count?: React.ReactNode
  icon?: S.IconDef
  right?: S.IconDef
  fg?: Color
  text: string
}

export class MenuList extends React.Component {
  selection = new Var('Inbox')

  items: MenuItem[] = [
    {
      key: 'Inbox',
      label: <b>Inbox</b>,
      icon: Icons.Inbox,
      unread: '23',
      text: randomLorem()
    },
    {
      key: 'Starred',
      label: 'Starred',
      icon: Icons.Star,
      fg: Yellow,
      text: randomLorem()
    },
    { key: 'Flagged', label: 'Flagged', text: randomLorem() },
    {
      key: 'Important',
      label: 'Important',
      icon: Icons.AlertOpen,
      right: Icons.CaretRight,
      text: randomLorem()
    },
    { key: 'Sent', label: 'Sent', text: randomLorem(), right: Icons.CaretRight },
    { key: 'Drafts', label: 'Drafts', text: randomLorem() },
    { key: 'Trash', label: 'Trash', icon: Icons.Trash, count: '4', text: randomLorem() },
    { key: 'Attachments', label: 'Attachments', text: randomLorem() }
  ]

  render(): React.ReactNode {
    return (
      <Box h>
        <Panel h elevate sep>
          <Box width={Unit * 8}>
            <Listbox<MenuItem, string>
              multi={false}
              required
              pad={5}
              items={this.items}
              selection={this.selection}
              renderGroup={this.renderGroup}
              renderItem={this.renderItem}
              identify={a => a.key}
              rowHeight={() => Unit}
            />
          </Box>
          <Box width={Unit * 10} pad={5}>
            <Use value={this.selection}>
              {sel => {
                const cur = this.items.find(i => i.key === sel)
                return (
                  cur && (
                    <>
                      <Box h>
                        <Label grow>
                          <b>{cur.label}</b>
                        </Label>
                        <Small>
                          <Box v center>
                            {cur.icon && <Icon fg={Primary} icon={cur.icon} />}
                          </Box>
                        </Small>
                      </Box>
                      <Label>{cur.text}</Label>
                    </>
                  )
                )
              }}
            </Use>
          </Box>
        </Panel>
      </Box>
    )
  }

  renderGroup = (children: ReactNode[], selected: boolean) => {
    return selected ? (
      <Theme primary>
        <Box bg clip rounded v>
          {children}
        </Box>
      </Theme>
    ) : (
      <Box clip v>
        {children}
      </Box>
    )
  }

  renderItem = (item: MenuItem, props: BoxProps, sel: boolean) => (
    <Box {...props} rounded h>
      <Icon icon={item.icon || Icons.Empty} fg={sel ? White : item.fg || Blue} />
      <Label grow>{item.label}</Label>
      {item.unread && (
        <Theme palette={sel ? Arctic : Lava}>
          <Tag margin round>
            <Label>{item.unread}</Label>
          </Tag>
        </Theme>
      )}
      {item.count && (
        <Tag margin round bg={Hovering}>
          <Label>{item.count}</Label>
        </Tag>
      )}
      {item.right && <Icon icon={item.right} />}
    </Box>
  )
}
