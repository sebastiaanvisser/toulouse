import React, { ReactNode } from 'react'
import { Box, Unit, BoxProps } from 'toulouse/box'
import { AlertOpen, CaretRight, Empty, Inbox, Star, Trash } from 'toulouse/icon'
import { Use, Var } from 'toulouse/lib'
import {
  Arctic,
  Blue,
  Color,
  Hover,
  Lava,
  PrimaryColor,
  White,
  Yellow,
  Primary
} from 'toulouse/styling'
import { IconDef, Img, Label, Listbox, Panel, Tag } from 'toulouse/widget'
import { randomLorem } from '../Lorem'

interface MenuItem {
  key: string
  label: React.ReactNode
  unread?: React.ReactNode
  count?: React.ReactNode
  icon?: IconDef
  right?: IconDef
  fg?: Color
  text: string
}

export class MenuList extends React.Component {
  selection = new Var('Inbox')

  items: MenuItem[] = [
    { key: 'Inbox', label: <b>Inbox</b>, icon: Inbox, unread: '23', text: randomLorem() },
    { key: 'Starred', label: 'Starred', icon: Star, fg: Yellow, text: randomLorem() },
    { key: 'Flagged', label: 'Flagged', text: randomLorem() },
    {
      key: 'Important',
      label: 'Important',
      icon: AlertOpen,
      right: CaretRight,
      text: randomLorem()
    },
    { key: 'Sent', label: 'Sent', text: randomLorem(), right: CaretRight },
    { key: 'Drafts', label: 'Drafts', text: randomLorem() },
    { key: 'Trash', label: 'Trash', icon: Trash, count: '4', text: randomLorem() },
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
                        <Box small v center>
                          {cur.icon && <Img fg={PrimaryColor} img={cur.icon} />}
                        </Box>
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
      <Box bg clip rounded palette={Primary} v>
        {children}
      </Box>
    ) : (
      <Box clip v>
        {children}
      </Box>
    )
  }

  renderItem = (item: MenuItem, props: BoxProps, sel: boolean) => (
    <Box {...props} rounded h>
      <Img img={item.icon || Empty} fg={sel ? White : item.fg || Blue} />
      <Label grow>{item.label}</Label>
      {item.unread && (
        <Tag margin round palette={sel ? Arctic : Lava}>
          <Label>{item.unread}</Label>
        </Tag>
      )}
      {item.count && (
        <Tag margin round bg={Hover}>
          <Label>{item.count}</Label>
        </Tag>
      )}
      {item.right && <Img img={item.right} />}
    </Box>
  )
}
