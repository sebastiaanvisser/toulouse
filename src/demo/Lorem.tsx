export const loremLines = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Vivamus eu blandit massa.',
    'Nunc dapibus at magna a rhoncus.',
    'Duis lobortis magna augue, quis varius purus sodales nec.',
    'Nunc tincidunt risus diam, eget sollicitudin velit suscipit in.',
    'Vivamus hendrerit, urna in efficitur laoreet, justo sapien dictum erat, finibus sollicitudin ex purus non metus.',
    'Etiam vel metus nec nisl sollicitudin vulputate.',
    'Aenean non libero leo.',
    'Praesent orci ex, eleifend ac malesuada vestibulum, gravida vitae orci.',
    'Quisque porttitor urna et felis aliquet, sed eleifend magna pharetra.',
    'Aenean ipsum quam, posuere tempor euismod vel, sagittis faucibus nulla.'
]

export const lorem = (n = 11) => loremLines.slice(0, n).join(' ')

export const randomLorem = () => {
    const count = 1 + Math.floor(Math.random() * 10)
    const start = Math.floor(Math.random() * (11 - count))
    return loremLines.slice(start, start + count).join(' ')
}

export interface Country {
    country: string
    capital: string
    lat: string
    long: string
    code?: string
    continent: string
}

export const AllCountries = (): Country[] => [
    {
        country: 'Somaliland',
        capital: 'Hargeisa',
        lat: '9.55',
        long: '44.050000',
        code: undefined,
        continent: 'Africa'
    }
]
