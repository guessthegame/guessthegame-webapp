import React from 'react';
import store from '../../store';
import screenshotService from '../../services/screenshotService';
import fullHeartIcon from './heart.png';
import emptyHeartIcon from './heart_empty.png';
import HalfHeartIcon from './heart_half.png';
import './ScreenshotRating.css';

class ScreenshotRating extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRatingPopupVisible: false,
      selectedOption: null,
    };
  }

  toggleRatingPopup = () => {
    if (!this.props.canRate) {
      alert(
        'Désolé, vous devez vous connecter pour pouvoir noter cette screenshot !'
      );
      return;
    }
    if (this.props.screenshot.isOwn) {
      alert('Désolé, vous ne pouvez pas noter vos propres screenshots.');
      return;
    }
    const { isRatingPopupVisible } = this.state;
    this.setState({ isRatingPopupVisible: !isRatingPopupVisible });
  };

  handleSelectOption = option => () => {
    this.setState({ selectedOption: option });
  };

  handleCancel = () => {
    this.setState({
      isRatingPopupVisible: false,
      selectedOption: null,
    });
  };

  handleValid = async () => {
    const { id } = this.props.screenshot;
    const ownRating = this.state.selectedOption;
    const res = await screenshotService.rate({
      screenshotId: id,
      rating: ownRating,
    });
    this.setState({
      isRatingPopupVisible: false,
      selectedOption: null,
    });
    store.dispatch({
      type: 'SCREENSHOT-LOAD-NEW_RATING',
      payload: {
        ownRating,
        averageRating: res.averageRating,
      },
    });
  };

  renderPopup = () => (
    <div className="ScreenshotRating_poup">
      <p className="ScreenshotRating_poup_title">
        Comment trouvez-vous ce screenshot&nbsp;?
      </p>
      <button
        onClick={this.handleSelectOption(10)}
        className={`ScreenshotRating_popup_option ${
          this.state.selectedOption === 10 ? '-selected' : ''
        }`}
      >
        <b>10/10</b> - {this.getRatingSmiley(10)} Parfait !!
      </button>
      <button
        onClick={this.handleSelectOption(8)}
        className={`ScreenshotRating_popup_option ${
          this.state.selectedOption === 8 ? '-selected' : ''
        }`}
      >
        <b>08/10</b> - {this.getRatingSmiley(8)} J&apos;aime beaucoup !
      </button>
      <button
        onClick={this.handleSelectOption(6)}
        className={`ScreenshotRating_popup_option ${
          this.state.selectedOption === 6 ? '-selected' : ''
        }`}
      >
        <b>06/10</b> - {this.getRatingSmiley(6)} Plutôt bien
      </button>
      <button
        onClick={this.handleSelectOption(4)}
        className={`ScreenshotRating_popup_option ${
          this.state.selectedOption === 4 ? '-selected' : ''
        }`}
      >
        <b>04/10</b> - {this.getRatingSmiley(4)} Bof, pas terrible
      </button>
      <button
        onClick={this.handleSelectOption(2)}
        className={`ScreenshotRating_popup_option ${
          this.state.selectedOption === 2 ? '-selected' : ''
        }`}
      >
        <b>02/10</b> - {this.getRatingSmiley(2)} Vraiment nul
      </button>
      <button
        onClick={this.handleSelectOption(0)}
        className={`ScreenshotRating_popup_option ${
          this.state.selectedOption === 0 ? '-selected' : ''
        }`}
      >
        <b>00/10</b> - {this.getRatingSmiley(0)} Peut pas faire pire...
      </button>

      <button
        className="ScreenshotRating_popup_button -cancel"
        onClick={this.handleCancel}
      >
        Annuler
      </button>
      <button
        className="ScreenshotRating_popup_button -valid"
        onClick={this.handleValid}
      >
        Valider !
      </button>
    </div>
  );

  getRatingSmiley = rating => {
    if (rating === 10) {
      return '😍';
    }
    if (rating === 8) {
      return '😀';
    }
    if (rating === 6) {
      return '🙂';
    }
    if (rating === 4) {
      return '🙁';
    }
    if (rating === 2) {
      return '😒';
    }
    if (rating === 0) {
      return '🤮';
    }
    return null;
  };

  render() {
    const { rating, ownRating } = this.props.screenshot;
    const { isRatingPopupVisible } = this.state;
    let title = 'Soyez le premier à noter cette screenshot !';
    if (rating !== null) {
      const ownRatingText =
        ownRating === null ? '' : ` ; Votre note : ${ownRating}`;
      title = `̀Note moyenne : ${rating.toFixed(2)}${ownRatingText}̀`;
    }
    return (
      <div
        className={`ScreenshotRating_rating ${
          rating === null ? '-disabled' : ''
        }`}
      >
        <button
          className="ScreenshotRating_rating_button"
          onClick={this.toggleRatingPopup}
          title={title}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rate => {
            let heart;
            const decimal = rating % 1;

            if (rating >= rate) {
              heart = fullHeartIcon;
            } else if (Math.round(rating + 0.5) < rate) {
              heart = emptyHeartIcon;
            } else if (decimal < 0.25) {
              heart = emptyHeartIcon;
            } else if (decimal >= 0.25 && decimal < 0.75) {
              heart = HalfHeartIcon;
            } else {
              heart = fullHeartIcon;
            }

            return (
              <img
                key={rate}
                src={heart}
                className={`ScreenshotRating_heart ${
                  rating === null ? '-disabled' : ''
                }`}
                alt="♡"
              />
            );
          })}
          {rating !== null && (
            <span className="ScreenshotRating_rating_note">
              {' '}
              {rating % 1 !== 0
                ? rating
                    .toFixed(2)
                    .toString()
                    .replace('.', ',')
                : rating}
              /10
            </span>
          )}{' '}
          {ownRating !== null ? (
            <span className="ScreenshotRating_ownRating">
              · {this.getRatingSmiley(ownRating)}
            </span>
          ) : null}
        </button>
        {isRatingPopupVisible ? this.renderPopup() : null}
      </div>
    );
  }
}
export default ScreenshotRating;
