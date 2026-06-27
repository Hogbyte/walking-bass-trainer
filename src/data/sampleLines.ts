export type BassTrack = {
  id: string;
  title: string;
  subtitle: string;
  tempo: number;
  description: string;
  alphaTex: string;
};

export const sampleTracks: BassTrack[] = [
  {
    id: 'g-major-iivi',
    title: 'G Major ii-V-I Progression',
    subtitle: 'Smooth Jazz Walking Path',
    tempo: 120,
    description: 'A classic 8-bar jazz turnaround using diatonic scalar approaches and smooth arpeggio connections.',
    alphaTex: `\\title "G Major ii-V-I"
\\subtitle "Jazz Walking Baseline"
\\clef bass
\\tuning (G2 D2 A1 E1)
\\tempo 120
:4 0.3 2.3 3.3 4.3 | 0.2 4.2 2.1 3.1 | 3.4 0.3 2.3 0.2 | 0.4 2.4 3.4 4.4 |
0.3 3.3 2.2 5.2 | 0.2 4.2 2.1 3.1 | 3.4 2.3 0.2 4.2 | 0.4 4.4 2.3 2.2 .`
  },
  {
    id: 'c-minor-blues',
    title: 'C Minor 12-Bar Blues',
    subtitle: 'Traditional Blues Sequence',
    tempo: 100,
    description: 'A traditional 12-bar minor blues line focusing on steady scalar movement and strong chromatic transitions.',
    alphaTex: `\\title "C Minor 12-Bar Blues"
\\subtitle "Blues Practice Line"
\\clef bass
\\tuning (G2 D2 A1 E1)
\\tempo 100
:4 3.3 5.3 1.2 2.2 | 3.2 5.2 1.1 5.2 | 3.3 1.2 0.1 3.1 | 5.2 3.1 0.1 2.2 |
3.2 5.2 1.1 2.1 | 3.1 1.1 5.2 3.2 | 3.3 5.3 1.2 2.2 | 3.2 1.2 0.2 3.3 |
4.4 3.3 1.2 4.2 | 3.4 2.3 0.2 3.2 | 3.3 1.2 0.1 3.1 | 3.4 0.3 2.3 0.2 .`
  }
];

export function getTrackById(id: string): BassTrack | undefined {
  return sampleTracks.find((track: BassTrack) => track.id === id);
}