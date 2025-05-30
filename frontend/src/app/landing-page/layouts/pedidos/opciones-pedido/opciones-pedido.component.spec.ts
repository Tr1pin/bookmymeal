import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpcionesPedidoComponent } from './opciones-pedido.component';

describe('OpcionesPedidoComponent', () => {
  let component: OpcionesPedidoComponent;
  let fixture: ComponentFixture<OpcionesPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpcionesPedidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpcionesPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
