import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'carta-product-details',
  templateUrl: './carta-product-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartaProductDetailsComponent {
  fallbackImage = '../../../../../../assets/images/static/empty.jpg';

  @Input() product: any;
  @Input() getImageUrl!: (imageName: string) => string;
  @Input() onImageError!: (event: Event) => void;
}

