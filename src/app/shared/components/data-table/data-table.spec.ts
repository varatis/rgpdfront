import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTable, TableColumn } from './data-table';

/** Colonnes du recueil de violation : elles se retirent une a une quand la place manque. */
const COLONNES: TableColumn[] = [
  { key: 'dateViolation', label: 'Date', sortable: true, width: '140px', dropOrder: 4 },
  { key: 'natureViolation', label: 'Nature de la violation DCP', sortable: true, width: 'auto' },
  { key: 'donneesConcernees', label: 'Données concernées', sortable: true, width: '240px', dropOrder: 3 },
  { key: 'nombrePersonnesConcernees', label: 'Personnes concernées', width: '200px', dropOrder: 1 },
  { key: 'risqueEleveDroitsLibertes', label: 'Risque élevé', width: '140px', dropOrder: 2 },
];

@Component({
  standalone: true,
  imports: [DataTable],
  template: `
    <div [style.width.px]="largeur()">
      <app-data-table [columns]="colonnes" [data]="lignes" trackKey="identifiant"></app-data-table>
    </div>
  `,
})
class HoteTest {
  readonly largeur = signal(1400);
  colonnes = COLONNES;
  lignes = [
    {
      identifiant: 1,
      dateViolation: '22/03/2021',
      natureViolation: 'utilisation non autorisé',
      donneesConcernees: 'numéro de téléphone',
      nombrePersonnesConcernees: 1,
      risqueEleveDroitsLibertes: 'Oui',
    },
  ];
}

describe('DataTable', () => {
  let fixture: ComponentFixture<HoteTest>;

  /** Le ResizeObserver notifie de façon asynchrone : on lui laisse un tour de boucle. */
  async function redimensionner(largeur: number): Promise<void> {
    fixture.componentInstance.largeur.set(largeur);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 60));
    fixture.detectChanges();
  }

  function enTetes(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('thead .header-label') as NodeListOf<HTMLElement>
    ).map((element) => element.textContent!.trim());
  }

  function largeurMinimale(): number {
    const table = fixture.nativeElement.querySelector('table') as HTMLElement;
    return parseInt(table.style.minWidth, 10);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HoteTest] }).compileComponents();
    fixture = TestBed.createComponent(HoteTest);
    fixture.detectChanges();
  });

  it('affiche toutes les colonnes quand la place suffit', async () => {
    await redimensionner(1400);

    expect(enTetes().length).toBe(5);
    expect(largeurMinimale()).toBe(980);
  });

  it('retire la colonne la moins prioritaire quand la table ne tient plus', async () => {
    await redimensionner(900);

    expect(enTetes()).not.toContain('Personnes concernées');
    expect(enTetes()).toContain('Risque élevé');
    expect(largeurMinimale()).toBe(780);
  });

  it('retire les colonnes suivantes à mesure que la liste se réduit', async () => {
    await redimensionner(700);

    expect(enTetes()).toEqual(['Date', 'Nature de la violation DCP', 'Données concernées']);
    expect(largeurMinimale()).toBe(640);
  });

  it('descend jusqu\'à deux colonnes', async () => {
    await redimensionner(420);

    expect(enTetes()).toEqual(['Date', 'Nature de la violation DCP']);
    expect(largeurMinimale()).toBe(400);
  });

  it('descend jusqu\'à une seule colonne', async () => {
    await redimensionner(300);

    expect(enTetes()).toEqual(['Nature de la violation DCP']);
    expect(largeurMinimale()).toBe(260);
  });

  it('garde toujours une colonne et laisse défiler quand tout le reste est masqué', async () => {
    await redimensionner(150);

    expect(enTetes()).toEqual(['Nature de la violation DCP']);
    expect(largeurMinimale()).toBe(260);
  });

  it('réaffiche les colonnes quand la place revient', async () => {
    await redimensionner(700);
    await redimensionner(1400);

    expect(enTetes().length).toBe(5);
  });

  it('masque aussi les cellules des colonnes retirées', async () => {
    await redimensionner(700);

    const cellules = fixture.nativeElement.querySelectorAll('tbody tr:first-child td');
    expect(cellules.length).toBe(4); // 3 colonnes + la colonne chevron
  });

  it("n'affiche pas d'ellipse dans la colonne du chevron", async () => {
    await redimensionner(900);

    const cellule: HTMLElement = fixture.nativeElement.querySelector('tbody .detail-col');

    // Un débordement ferait apparaître le « … » hérité de l'ellipse des autres cellules.
    expect(cellule.scrollWidth).toBe(cellule.clientWidth);
  });
});
