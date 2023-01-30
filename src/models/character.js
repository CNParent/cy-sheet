const character = () => ({
    name: '',
    glitches: {
        die: 'd2',
        current: 0
    },
    hp: {
        current: 0,
        max: 0
    },
    abilities: {
        strength: 0,
        agility: 0,
        presence: 0,
        toughness: 0,
        knowledge: 0
    },
    creds: 0,
    debt: 0,
    className: '',
    infestations: [],
    powers: [],
    armor: 'None',
    armorValue: '-',
    weapons: [],
    equipment: [],
    cybertech: [],
    info: ''
});

export default character;
