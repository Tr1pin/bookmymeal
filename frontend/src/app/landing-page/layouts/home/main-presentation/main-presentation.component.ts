import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component} from "@angular/core";


@Component({
  selector: 'app-home-main-presentation-component',
  imports: [ CommonModule],
  templateUrl: './main-presentation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPresentationComponent {}