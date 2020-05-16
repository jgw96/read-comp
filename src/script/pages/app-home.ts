import { LitElement, css, html, customElement, property } from 'lit-element';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';

import { loadingController, toastController } from '@ionic/core';

@customElement('app-home')
export class AppHome extends LitElement {

  @property() model: any = null;
  @property({ type: String }) question: string = "";
  @property({ type: String }) content: string = "";
  @property({ type: Array }) answers: any[] = [];

  tempArray = [];

  static get styles() {
    return css`

    `;
  }

  constructor() {
    super();
  }

  async ask() {
    const loading = await loadingController.create({
      message: "Thinking..."
    });
    await loading.present();

    if (!this.model) {
      // lazy import and load tensorflow module
      await import('@tensorflow/tfjs-core');
      const module = await import('@tensorflow-models/qna');
      console.log(module);
      this.model = await module.load();
    }

    if (this.question && this.question.length > 0 && this.content && this.content.length > 0) {
      let answers;

      try {
        answers = await this.model.findAnswers(this.question, this.content);
      }
      catch (err) {
        console.error(err);
      }
      
      console.log(answers);

      if (answers && answers.length > 1) {
        (this.tempArray as any).unshift({
          question: this.question,
          answer: answers[0].text
        });

        this.answers = [...this.tempArray];
      }
    }
    else {
      const toast = await toastController.create({
        message: "You must enter a question and text to comprehend...",
        duration: 1800,
        mode: "ios"
      });
      await toast.present();
    }

    (this.shadowRoot?.querySelector('input') as HTMLInputElement).value = "";

    await loading.dismiss();
  }

  updateQuestion(ev: any) {
    this.question = ev.target.value;
  }
  
  updateContent(ev: any) {
    this.content = ev.target.value;
  }

  render() {
    return html`
      <div>
        <textarea @change="${this.updateContent}"></textarea>

        <ion-button @click="${() => this.ask()}">Click</ion-button>

        <input type="text" placeholder="a question" @change="${this.updateQuestion}">
        <pwa-install>Install PWA Starter</pwa-install>
      </div>
    `;
  }
}